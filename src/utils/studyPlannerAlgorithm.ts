import { v4 as uuidv4 } from 'uuid';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface Topic {
    id: string;
    name: string;
    confident: boolean;
}

export interface Subject {
    id: string;
    name: string;
    difficulty: 1 | 2 | 3 | 4 | 5; // 1 = easy, 5 = hard
    isWeak: boolean;
    topics: Topic[];
}

export interface StudyTaskType {
    id: string;
    date: string;            // ISO date string "YYYY-MM-DD"
    subjectId: string;
    subjectName: string;
    topicId: string | null;
    topicName: string;
    type: 'study' | 'revision' | 'final_revision';
    durationHours: number;
    completed: boolean;
}

export interface StudyPlanInput {
    examName: string;
    examDate: string;        // ISO "YYYY-MM-DD"
    dailyHours: number;
    subjects: Subject[];
}

export interface StudyPlan {
    id: string;
    examName: string;
    examDate: string;
    dailyHours: number;
    subjects: Subject[];
    tasks: StudyTaskType[];
    createdAt: number;
}

// ────────────────────────────────────────────────────────────
// Helper: date utilities
// ────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function toISO(date: Date): string {
    return date.toISOString().split('T')[0];
}

function daysBetween(a: Date, b: Date): number {
    return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

// ────────────────────────────────────────────────────────────
// Core algorithm
// ────────────────────────────────────────────────────────────

/**
 * Weighted subject distribution:
 *   weight = difficulty * (weak subjects get 1.6× multiplier)
 * Normalise weights → fraction of total hours.
 * Distribute topics across days, respecting daily hour cap.
 * Insert spaced-repetition revision every 4 study sessions.
 * Reserve last 2 days before exam for final revision.
 */
export function generateStudyPlan(input: StudyPlanInput): StudyTaskType[] {
    const tasks: StudyTaskType[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(input.examDate);
    examDate.setHours(0, 0, 0, 0);

    const totalDays = daysBetween(today, examDate);
    if (totalDays <= 0 || input.subjects.length === 0) return [];

    // Reserve last 2 days for final revision (or 1 if very short)
    const finalRevDays = Math.min(2, Math.max(1, Math.floor(totalDays * 0.1)));
    const studyDays = totalDays - finalRevDays;
    if (studyDays <= 0) return [];

    // ── Compute subject weights ──────────────────────────────
    const rawWeights = input.subjects.map(s => {
        const base = s.difficulty;          // 1–5
        const weakBonus = s.isWeak ? 1.6 : 1.0;
        const notConfidentTopics = s.topics.filter(t => !t.confident).length;
        const topicPenalty = notConfidentTopics * 0.2;
        return (base + topicPenalty) * weakBonus;
    });
    const totalWeight = rawWeights.reduce((a, b) => a + b, 0);
    const subjectFractions = rawWeights.map(w => w / totalWeight);

    // ── Total study hours available ──────────────────────────
    const totalStudyHours = studyDays * input.dailyHours;

    // ── Build topic queues per subject ───────────────────────
    interface TopicTask {
        subjectId: string;
        subjectName: string;
        topicId: string;
        topicName: string;
        remaining: number;  // hours remaining for this topic
    }

    const HOURS_PER_TOPIC = 1.0;

    const queues: TopicTask[][] = input.subjects.map((s, si) => {
        const allocated = totalStudyHours * subjectFractions[si];
        const topicsToUse = s.topics.length > 0 ? s.topics : [{ id: uuidv4(), name: s.name, confident: true }];

        // Distribute allocated hours across topics (round-robin, prioritise not-confident)
        const sorted = [...topicsToUse].sort((a, b) => (a.confident ? 1 : -1) - (b.confident ? 1 : -1));
        const result: TopicTask[] = [];
        let remaining = allocated;

        for (const t of sorted) {
            if (remaining <= 0) break;
            const hrs = Math.min(HOURS_PER_TOPIC, remaining);
            result.push({
                subjectId: s.id,
                subjectName: s.name,
                topicId: t.id,
                topicName: t.name,
                remaining: Math.round(hrs * 2) / 2,   // round to 0.5
            });
            remaining -= hrs;
        }
        // If more hours remain than topics, repeat topics
        while (remaining > 0.5) {
            for (const t of sorted) {
                if (remaining <= 0) break;
                const hrs = Math.min(HOURS_PER_TOPIC, remaining);
                result.push({
                    subjectId: s.id,
                    subjectName: s.name,
                    topicId: t.id,
                    topicName: t.name + ' (Review)',
                    remaining: Math.round(hrs * 2) / 2,
                });
                remaining -= hrs;
            }
        }
        return result;
    });

    // Interleave: for each day, pick from subjects in fraction order
    const allTopics: TopicTask[] = [];
    // Merge queues by cycling through subjects proportionally
    {
        const indices = input.subjects.map(() => 0);
        const lengths = queues.map(q => q.length);
        let total = lengths.reduce((a, b) => a + b, 0);
        let safetyCounter = 0;
        while (total > 0 && safetyCounter < 2000) {
            safetyCounter++;
            for (let si = 0; si < input.subjects.length; si++) {
                if (indices[si] < lengths[si]) {
                    allTopics.push(queues[si][indices[si]]);
                    indices[si]++;
                    total--;
                }
            }
        }
    }

    // ── Assign to days ───────────────────────────────────────
    let topicIdx = 0;
    let sessionsSinceRevision = 0;

    for (let day = 0; day < studyDays; day++) {
        const date = toISO(addDays(today, day));
        let hoursLeft = input.dailyHours;

        // Spaced repetition: insert a revision day every 4 sessions
        if (sessionsSinceRevision >= 4 && day > 0) {
            const revDuration = Math.min(hoursLeft, input.subjects.length * 0.5);
            input.subjects.forEach(s => {
                tasks.push({
                    id: uuidv4(),
                    date,
                    subjectId: s.id,
                    subjectName: s.name,
                    topicId: null,
                    topicName: 'Revision',
                    type: 'revision',
                    durationHours: Math.max(0.5, revDuration / input.subjects.length),
                    completed: false,
                });
            });
            sessionsSinceRevision = 0;
            hoursLeft -= revDuration;
        }

        while (hoursLeft > 0.25 && topicIdx < allTopics.length) {
            const topic = allTopics[topicIdx];
            const duration = Math.min(hoursLeft, topic.remaining);
            tasks.push({
                id: uuidv4(),
                date,
                subjectId: topic.subjectId,
                subjectName: topic.subjectName,
                topicId: topic.topicId,
                topicName: topic.topicName,
                type: 'study',
                durationHours: Math.round(duration * 2) / 2,
                completed: false,
            });
            hoursLeft -= duration;
            sessionsSinceRevision++;
            topicIdx++;
        }
    }

    // ── Final revision block ─────────────────────────────────
    for (let d = 0; d < finalRevDays; d++) {
        const date = toISO(addDays(examDate, -(finalRevDays - d)));
        input.subjects.forEach(s => {
            tasks.push({
                id: uuidv4(),
                date,
                subjectId: s.id,
                subjectName: s.name,
                topicId: null,
                topicName: 'Final Revision — ' + s.name,
                type: 'final_revision',
                durationHours: Math.max(0.5, input.dailyHours / input.subjects.length),
                completed: false,
            });
        });
    }

    return tasks;
}

// ────────────────────────────────────────────────────────────
// Stats helpers (used by Dashboard)
// ────────────────────────────────────────────────────────────

export function computeStats(plan: StudyPlan) {
    const total = plan.tasks.length;
    const done = plan.tasks.filter(t => t.completed).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    // Per-subject progress
    const subjectProgress = plan.subjects.map(s => {
        const subTasks = plan.tasks.filter(t => t.subjectId === s.id);
        const subDone = subTasks.filter(t => t.completed).length;
        return {
            subject: s,
            total: subTasks.length,
            done: subDone,
            pct: subTasks.length > 0 ? Math.round((subDone / subTasks.length) * 100) : 0,
        };
    });

    // Streak: consecutive days ending today with at least one completed task
    const today = toISO(new Date());
    const completedDates = new Set(plan.tasks.filter(t => t.completed).map(t => t.date));
    let streak = 0;
    let checkDay = new Date();
    while (true) {
        const ds = toISO(checkDay);
        if (completedDates.has(ds)) {
            streak++;
            checkDay = addDays(checkDay, -1);
        } else break;
    }

    // Upcoming tasks (next 3, not completed, from today onwards)
    const upcoming = plan.tasks
        .filter(t => !t.completed && t.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    return { total, done, pct, subjectProgress, streak, upcoming };
}
