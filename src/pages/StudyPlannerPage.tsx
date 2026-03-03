import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
    FiArrowLeft, FiBookOpen, FiCalendar, FiBarChart2,
    FiPlus, FiTrash2, FiCheck, FiZap, FiRefreshCw,
    FiExternalLink, FiStar, FiAlertTriangle, FiClock,
    FiAward, FiTrendingUp, FiList,
} from 'react-icons/fi';
import { useStudyPlannerStore } from '../store/studyPlannerStore';
import { computeStats } from '../utils/studyPlannerAlgorithm';
import type { Subject, Topic } from '../utils/studyPlannerAlgorithm';

// ── Shared styles ──────────────────────────────────────────
const VIOLET = 'var(--violet, #7c3aed)';
const card: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '20px',
};

const taskTypeColors = {
    study: { bg: 'rgba(167,139,250,0.12)', text: '#a78bfa', border: '#a78bfa40', label: 'Study' },
    revision: { bg: 'rgba(103,232,249,0.12)', text: '#67e8f9', border: '#67e8f940', label: 'Revision' },
    final_revision: { bg: 'rgba(253,164,175,0.12)', text: '#fda4af', border: '#fda4af40', label: 'Final Revision' },
};

const difficultyColors = ['', '#86efac', '#a7f3d0', '#fde68a', '#fca5a5', '#f87171'];

// ── Helpers ────────────────────────────────────────────────
function formatDate(iso: string) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

type Tab = 'create' | 'timetable' | 'dashboard';

// ──────────────────────────────────────────────────────────
const StudyPlannerPage: React.FC = () => {
    const navigate = useNavigate();
    const { plan, createPlan, clearPlan, toggleTask } = useStudyPlannerStore();
    const [tab, setTab] = useState<Tab>(plan ? 'timetable' : 'create');

    // ── Form state ─────────────────────────────────────────
    const [examName, setExamName] = useState('');
    const [examDate, setExamDate] = useState('');
    const [dailyHours, setDailyHours] = useState(4);
    const [subjects, setSubjects] = useState<Subject[]>([
        { id: uuidv4(), name: '', difficulty: 3, isWeak: false, topics: [] },
    ]);
    const [generating, setGenerating] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const addSubject = useCallback(() => {
        setSubjects(s => [...s, { id: uuidv4(), name: '', difficulty: 3, isWeak: false, topics: [] }]);
    }, []);

    const removeSubject = useCallback((id: string) => {
        setSubjects(s => s.filter(x => x.id !== id));
    }, []);

    const updateSubject = useCallback((id: string, patch: Partial<Subject>) => {
        setSubjects(s => s.map(x => x.id === id ? { ...x, ...patch } : x));
    }, []);

    const addTopic = useCallback((subjectId: string) => {
        setSubjects(s => s.map(x => x.id === subjectId
            ? { ...x, topics: [...x.topics, { id: uuidv4(), name: '', confident: true }] }
            : x));
    }, []);

    const removeTopic = useCallback((subjectId: string, topicId: string) => {
        setSubjects(s => s.map(x => x.id === subjectId
            ? { ...x, topics: x.topics.filter(t => t.id !== topicId) }
            : x));
    }, []);

    const updateTopic = useCallback((subjectId: string, topicId: string, patch: Partial<Topic>) => {
        setSubjects(s => s.map(x => x.id === subjectId
            ? { ...x, topics: x.topics.map(t => t.id === topicId ? { ...t, ...patch } : t) }
            : x));
    }, []);

    const handleGenerate = useCallback(() => {
        setFormError(null);
        if (!examName.trim()) { setFormError('Enter an exam name.'); return; }
        if (!examDate) { setFormError('Select an exam date.'); return; }
        if (new Date(examDate) <= new Date()) { setFormError('Exam date must be in the future.'); return; }
        if (subjects.some(s => !s.name.trim())) { setFormError('All subjects need a name.'); return; }
        if (subjects.length === 0) { setFormError('Add at least one subject.'); return; }

        setGenerating(true);
        setTimeout(() => {
            createPlan({ examName, examDate, dailyHours, subjects });
            setGenerating(false);
            setTab('timetable');
        }, 600);
    }, [examName, examDate, dailyHours, subjects, createPlan]);

    // ── Stats ───────────────────────────────────────────────
    const stats = plan ? computeStats(plan) : null;

    // Group timetable tasks by date
    const tasksByDate = plan ? (() => {
        const map: Record<string, typeof plan.tasks> = {};
        const today = new Date().toISOString().split('T')[0];
        plan.tasks
            .filter(t => t.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date))
            .forEach(t => {
                if (!map[t.date]) map[t.date] = [];
                map[t.date].push(t);
            });
        return map;
    })() : {};

    // Min date = tomorrow
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    // ── UI ─────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

            {/* ── Header ── */}
            <header style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '0 24px', height: '58px', borderBottom: '1px solid var(--border)',
                background: 'var(--surface)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 20,
            }}>
                <button onClick={() => navigate('/canvas')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', padding: '6px 10px', borderRadius: '8px' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                    <FiArrowLeft size={15} /> Back to Canvas
                </button>
                <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
                <span style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBookOpen style={{ color: VIOLET }} /> AI Study Planner
                </span>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginLeft: '24px', background: 'var(--surface-2)', padding: '4px', borderRadius: '10px' }}>
                    {([
                        { key: 'create', icon: <FiPlus size={13} />, label: 'Create Plan' },
                        { key: 'timetable', icon: <FiCalendar size={13} />, label: 'Timetable' },
                        { key: 'dashboard', icon: <FiBarChart2 size={13} />, label: 'Dashboard' },
                    ] as { key: Tab; icon: React.ReactNode; label: string }[]).map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                            fontWeight: 600, fontSize: '13px', transition: 'all 0.15s',
                            background: tab === t.key ? VIOLET : 'transparent',
                            color: tab === t.key ? 'white' : 'var(--text-muted)',
                        }}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {plan && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            📅 {plan.examName} — {formatDate(plan.examDate)}
                        </span>
                        <button onClick={() => { if (confirm('Clear current plan?')) { clearPlan(); setTab('create'); } }} style={{
                            display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px',
                            borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent',
                            color: '#f87171', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                        }}>
                            <FiRefreshCw size={12} /> New Plan
                        </button>
                    </div>
                )}
            </header>

            {/* ── Body ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

                {/* ════════════════════════════════════════════
                    TAB 1 — CREATE PLAN
                ════════════════════════════════════════════ */}
                {tab === 'create' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Hero */}
                        <div style={{ ...card, background: 'linear-gradient(135deg, #2d1b69 0%, #1e1b4b 100%)', border: '1px solid #6d28d940', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 32px' }}>
                            <div>
                                <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, color: 'white' }}>Create Your Study Plan</h2>
                                <p style={{ margin: 0, color: '#c4b5fd', fontSize: '14px' }}>
                                    AI-powered · Spaced repetition · Weak-subject adaptive · 100% offline
                                </p>
                            </div>
                            <FiZap size={48} style={{ color: '#a78bfa', opacity: 0.6 }} />
                        </div>

                        {/* Basics */}
                        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiCalendar size={15} style={{ color: VIOLET }} /> Exam Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Exam / Course Name</label>
                                    <input value={examName} onChange={e => setExamName(e.target.value)} placeholder="e.g. BCA Semester 4" style={inputStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Exam Date</label>
                                    <input type="date" value={examDate} min={minDateStr} onChange={e => setExamDate(e.target.value)} style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    Study hours per day — <span style={{ color: VIOLET }}>{dailyHours}h</span>
                                </label>
                                <input type="range" min={1} max={12} value={dailyHours} onChange={e => setDailyHours(+e.target.value)}
                                    style={{ accentColor: VIOLET, width: '100%' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                    <span>1h (Light)</span><span>6h (Moderate)</span><span>12h (Intense)</span>
                                </div>
                            </div>
                        </div>

                        {/* Subjects */}
                        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiBookOpen size={15} style={{ color: VIOLET }} /> Subjects &amp; Topics
                                </h3>
                                <button onClick={addSubject} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '8px', border: `1px dashed ${VIOLET}`, background: 'transparent', color: VIOLET, cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                                    <FiPlus size={13} /> Add Subject
                                </button>
                            </div>

                            {subjects.map((s, si) => (
                                <div key={s.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface-2)' }}>
                                    {/* Subject header */}
                                    <div style={{ padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px', flex: 1 }}>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>#{si + 1}</span>
                                            <input value={s.name} onChange={e => updateSubject(s.id, { name: e.target.value })} placeholder="Subject name…" style={{ ...inputStyle, flex: 1 }} />
                                        </div>

                                        {/* Difficulty */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Difficulty:</span>
                                            {[1, 2, 3, 4, 5].map(d => (
                                                <button key={d} onClick={() => updateSubject(s.id, { difficulty: d as Subject['difficulty'] })} style={{
                                                    width: '26px', height: '26px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px',
                                                    background: s.difficulty >= d ? difficultyColors[s.difficulty] : 'var(--surface)',
                                                    color: s.difficulty >= d ? '#1e293b' : 'var(--text-muted)',
                                                    transition: 'all 0.1s',
                                                }}>{d}</button>
                                            ))}
                                        </div>

                                        {/* Weak toggle */}
                                        <button onClick={() => updateSubject(s.id, { isWeak: !s.isWeak })} style={{
                                            display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '999px',
                                            border: `1px solid ${s.isWeak ? '#fca5a5' : 'var(--border)'}`,
                                            background: s.isWeak ? 'rgba(252,165,165,0.12)' : 'transparent',
                                            color: s.isWeak ? '#fca5a5' : 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                        }}>
                                            <FiAlertTriangle size={11} /> {s.isWeak ? 'Weak Subject' : 'Mark Weak'}
                                        </button>

                                        {subjects.length > 1 && (
                                            <button onClick={() => removeSubject(s.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}>
                                                <FiTrash2 size={15} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Topics */}
                                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Topics</span>
                                            <button onClick={() => addTopic(s.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: VIOLET, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                                                <FiPlus size={11} /> Add Topic
                                            </button>
                                        </div>
                                        {s.topics.length === 0 && (
                                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No topics added — planner will use the subject name.</p>
                                        )}
                                        {s.topics.map(t => (
                                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input value={t.name} onChange={e => updateTopic(s.id, t.id, { name: e.target.value })} placeholder="Topic name…" style={{ ...inputStyle, flex: 1, fontSize: '13px', padding: '7px 10px' }} />
                                                <button onClick={() => updateTopic(s.id, t.id, { confident: !t.confident })} title={t.confident ? 'Mark as Not Confident' : 'Mark Confident'} style={{
                                                    padding: '5px 10px', borderRadius: '8px', border: `1px solid ${t.confident ? '#86efac40' : '#fca5a540'}`,
                                                    background: t.confident ? 'rgba(134,239,172,0.1)' : 'rgba(252,165,165,0.1)',
                                                    color: t.confident ? '#86efac' : '#fca5a5', cursor: 'pointer', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap',
                                                }}>
                                                    {t.confident ? '✓ Confident' : '⚠ Not Sure'}
                                                </button>
                                                <button onClick={() => removeTopic(s.id, t.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}>
                                                    <FiTrash2 size={13} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Error */}
                        {formError && (
                            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiAlertTriangle size={15} /> {formError}
                            </div>
                        )}

                        {/* Generate */}
                        <button onClick={handleGenerate} disabled={generating} style={{
                            padding: '15px', borderRadius: '12px', border: 'none',
                            background: generating ? 'var(--surface-2)' : `linear-gradient(135deg, #7c3aed, #6d28d9)`,
                            color: generating ? 'var(--text-muted)' : 'white', cursor: generating ? 'default' : 'pointer',
                            fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            boxShadow: generating ? 'none' : '0 8px 24px rgba(124,58,237,0.4)',
                            transition: 'all 0.2s',
                        }}>
                            {generating ? <><FiRefreshCw size={17} style={{ animation: 'spin 1s linear infinite' }} /> Generating your plan…</>
                                : <><FiZap size={17} /> Generate Smart Study Plan</>}
                        </button>
                    </div>
                )}

                {/* ════════════════════════════════════════════
                    TAB 2 — TIMETABLE
                ════════════════════════════════════════════ */}
                {tab === 'timetable' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {!plan ? (
                            <EmptyState onCreate={() => setTab('create')} />
                        ) : Object.keys(tasksByDate).length === 0 ? (
                            <div style={{ ...card, textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                <FiCheck size={40} style={{ color: '#86efac', marginBottom: '12px' }} />
                                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>All tasks completed! 🎉</p>
                                <p style={{ margin: '8px 0 0', fontSize: '14px' }}>Good luck on your exam!</p>
                            </div>
                        ) : (
                            Object.entries(tasksByDate).map(([date, tasks]) => (
                                <div key={date} style={card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            📅 {formatDate(date)}
                                        </h3>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {tasks.filter(t => t.completed).length}/{tasks.length} done
                                            · {tasks.reduce((a, t) => a + t.durationHours, 0).toFixed(1)}h total
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {tasks.map(t => {
                                            const tc = taskTypeColors[t.type];
                                            return (
                                                <div key={t.id} onClick={() => toggleTask(t.id)} style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '12px 14px', borderRadius: '10px',
                                                    border: `1px solid ${t.completed ? 'var(--border)' : tc.border}`,
                                                    background: t.completed ? 'transparent' : tc.bg,
                                                    cursor: 'pointer', transition: 'all 0.15s', opacity: t.completed ? 0.55 : 1,
                                                }}>
                                                    {/* Checkbox */}
                                                    <div style={{
                                                        width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                                                        border: `2px solid ${t.completed ? '#86efac' : tc.text}`,
                                                        background: t.completed ? '#86efac20' : 'transparent',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        {t.completed && <FiCheck size={12} color="#86efac" />}
                                                    </div>

                                                    {/* Info */}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', textDecoration: t.completed ? 'line-through' : 'none' }}>
                                                            {t.topicName}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {t.subjectName} · {t.durationHours}h
                                                        </div>
                                                    </div>

                                                    {/* Type badge */}
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                                                        background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`,
                                                        flexShrink: 0,
                                                    }}>
                                                        {tc.label}
                                                    </span>

                                                    {/* Whiteboard button */}
                                                    {t.type === 'study' && (
                                                        <button onClick={e => { e.stopPropagation(); navigate('/canvas'); }} style={{
                                                            display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px',
                                                            borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)',
                                                            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                                                        }}
                                                            title="Open whiteboard for this topic"
                                                        >
                                                            <FiExternalLink size={11} /> Whiteboard
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ════════════════════════════════════════════
                    TAB 3 — DASHBOARD
                ════════════════════════════════════════════ */}
                {tab === 'dashboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {!plan || !stats ? (
                            <EmptyState onCreate={() => setTab('create')} />
                        ) : (
                            <>
                                {/* KPI row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                    <KpiCard icon={<FiTrendingUp size={20} color="#a78bfa" />} label="Overall Progress" value={`${stats.pct}%`} sub={`${stats.done} / ${stats.total} tasks`} color="#a78bfa" />
                                    <KpiCard icon={<FiAward size={20} color="#fbbf24" />} label="Study Streak" value={`${stats.streak} day${stats.streak !== 1 ? 's' : ''}`} sub={stats.streak > 0 ? '🔥 Keep it up!' : 'Start today!'} color="#fbbf24" />
                                    <KpiCard icon={<FiClock size={20} color="#67e8f9" />} label="Days to Exam" value={`${Math.max(0, Math.ceil((new Date(plan.examDate).getTime() - Date.now()) / 86_400_000))}`} sub={plan.examName} color="#67e8f9" />
                                </div>

                                {/* Overall progress bar */}
                                <div style={card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700 }}>📊 Overall Syllabus Progress</span>
                                        <span style={{ fontSize: '14px', fontWeight: 800, color: VIOLET }}>{stats.pct}%</span>
                                    </div>
                                    <ProgressBar pct={stats.pct} color="#7c3aed" height={14} />
                                </div>

                                {/* Per-subject bars */}
                                <div style={card}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700 }}>
                                        <FiList size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: VIOLET }} />
                                        Subject Progress
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {stats.subjectProgress.map(sp => {
                                            const col = difficultyColors[sp.subject.difficulty] || '#a78bfa';
                                            return (
                                                <div key={sp.subject.id}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{sp.subject.name}</span>
                                                            {sp.subject.isWeak && (
                                                                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: 'rgba(252,165,165,0.15)', color: '#fca5a5', border: '1px solid #fca5a540' }}>WEAK</span>
                                                            )}
                                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Difficulty: {sp.subject.difficulty}/5</span>
                                                        </div>
                                                        <span style={{ fontSize: '13px', fontWeight: 700, color: col }}>{sp.pct}%</span>
                                                    </div>
                                                    <ProgressBar pct={sp.pct} color={col} height={8} />
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{sp.done}/{sp.total} tasks done</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Upcoming tasks */}
                                {stats.upcoming.length > 0 && (
                                    <div style={card}>
                                        <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700 }}>
                                            <FiCalendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: VIOLET }} />
                                            Upcoming Tasks
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {stats.upcoming.map(t => {
                                                const tc = taskTypeColors[t.type];
                                                return (
                                                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, flexShrink: 0 }}>{tc.label}</span>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.topicName}</div>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.subjectName}</div>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                                                            <div>{formatDate(t.date)}</div>
                                                            <div>{t.durationHours}h</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Spin keyframe (injected once) */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

// ── Sub-components ─────────────────────────────────────────

const inputStyle: React.CSSProperties = {
    padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.15s', width: '100%', boxSizing: 'border-box',
};

const ProgressBar: React.FC<{ pct: number; color: string; height?: number }> = ({ pct, color, height = 10 }) => (
    <div style={{ width: '100%', height: `${height}px`, background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
            width: `${Math.min(100, pct)}%`, height: '100%', borderRadius: '999px',
            background: color, transition: 'width 0.6s ease',
        }} />
    </div>
);

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub: string; color: string }> = ({ icon, label, value, sub, color }) => (
    <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
            {icon} {label}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</div>
    </div>
);

const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
    <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
        padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
    }}>
        <FiStar size={48} style={{ color: 'var(--violet)', opacity: 0.4 }} />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>No study plan yet</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Create a plan to see your timetable and progress dashboard.</p>
        <button onClick={onCreate} style={{
            padding: '11px 24px', borderRadius: '10px', border: 'none',
            background: VIOLET, color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
        }}>
            <FiPlus size={15} /> Create Study Plan
        </button>
    </div>
);

export default StudyPlannerPage;
