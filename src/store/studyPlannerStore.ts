import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { StudyPlan, StudyTaskType, Subject } from '../utils/studyPlannerAlgorithm';
import { generateStudyPlan } from '../utils/studyPlannerAlgorithm';
import { useAuthStore } from './authStore';

const getKey = () => {
    const user = useAuthStore.getState().user;
    return user ? `ag_planner_${user.uid}` : 'ag_planner';
};

function persist(plan: StudyPlan | null) {
    if (plan) localStorage.setItem(getKey(), JSON.stringify(plan));
    else localStorage.removeItem(getKey());
}

function load(): StudyPlan | null {
    try {
        const raw = localStorage.getItem(getKey());
        return raw ? JSON.parse(raw) as StudyPlan : null;
    } catch { return null; }
}

interface StudyPlannerState {
    plan: StudyPlan | null;
    createPlan: (input: {
        examName: string;
        examDate: string;
        dailyHours: number;
        subjects: Subject[];
    }) => void;
    clearPlan: () => void;
    toggleTask: (taskId: string) => void;
}

export const useStudyPlannerStore = create<StudyPlannerState>((set, get) => ({
    plan: load(),

    createPlan: ({ examName, examDate, dailyHours, subjects }) => {
        const tasks = generateStudyPlan({ examName, examDate, dailyHours, subjects });
        const plan: StudyPlan = {
            id: uuidv4(),
            examName,
            examDate,
            dailyHours,
            subjects,
            tasks,
            createdAt: Date.now(),
        };
        persist(plan);
        set({ plan });
    },

    clearPlan: () => {
        persist(null);
        set({ plan: null });
    },

    toggleTask: (taskId: string) => {
        const { plan } = get();
        if (!plan) return;
        const tasks: StudyTaskType[] = plan.tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const updated = { ...plan, tasks };
        persist(updated);
        set({ plan: updated });
    },
}));
