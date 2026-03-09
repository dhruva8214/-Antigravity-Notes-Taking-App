import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiZap, FiTrash2, FiPlus, FiChevronLeft,
    FiChevronRight, FiDownload, FiCheck, FiX,
    FiBook, FiStar, FiRefreshCw, FiAlertTriangle,
} from 'react-icons/fi';
import { useFlashcardsStore } from '../store/flashcardsStore';
import { generateFlashcards } from '../utils/groqFlashcards';
import type { Flashcard } from '../utils/groqFlashcards';
import jsPDF from 'jspdf';

// ── Constants ─────────────────────────────────────────────────
const VIOLET = '#7c3aed';
const CYAN = '#67e8f9';
const GREEN = '#86efac';

type Tab = 'generate' | 'review' | 'study';

// ── CSV Export ────────────────────────────────────────────────
function exportCSV(cards: Flashcard[], name: string) {
    const header = 'Question,Answer,Tag\n';
    const rows = cards.map(c =>
        `"${c.question.replace(/"/g, '""')}","${c.answer.replace(/"/g, '""')}","${c.tag.replace(/"/g, '""')}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}_flashcards.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportPDF(cards: Flashcard[], name: string) {
    const doc = new jsPDF();
    const margin = 14;
    let y = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(name + ' — Flashcards', margin, y);
    y += 12;

    cards.forEach((card, i) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 40, 180);
        doc.text(`Card ${i + 1}  [${card.tag}]`, margin, y);
        y += 7;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text('Q: ' + card.question, margin, y, { maxWidth: 180 });
        const qLines = doc.splitTextToSize(card.question, 175).length;
        y += qLines * 6 + 3;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text('A: ' + card.answer, margin, y, { maxWidth: 180 });
        const aLines = doc.splitTextToSize(card.answer, 175).length;
        y += aLines * 6 + 10;

        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y - 5, 196, y - 5);
    });

    doc.save(`${name.replace(/\s+/g, '_')}_flashcards.pdf`);
}

// ── Flip Card Component ───────────────────────────────────────
const FlipCard: React.FC<{
    card: Flashcard;
    onDelete?: () => void;
    showDeleteBtn?: boolean;
}> = ({ card, onDelete, showDeleteBtn = true }) => {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => { setFlipped(false); }, [card.id]);

    return (
        <div style={{ perspective: '1000px', width: '100%', maxWidth: '580px', margin: '0 auto' }}>
            <div
                onClick={() => setFlipped(f => !f)}
                style={{
                    position: 'relative', width: '100%', paddingBottom: '65%',
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                    cursor: 'pointer',
                }}
            >
                {/* Front */}
                <div style={{
                    position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                    borderRadius: '20px', padding: '28px',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.05) 100%)',
                    border: `2px solid ${VIOLET}40`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
                }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: VIOLET, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
                        {card.tag}
                    </span>
                    <div style={{ fontSize: 'clamp(16px,2.5vw,22px)', fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {card.question}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Click to reveal answer
                    </span>
                </div>

                {/* Back */}
                <div style={{
                    position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: '20px', padding: '28px',
                    background: 'linear-gradient(135deg, rgba(103,232,249,0.12) 0%, rgba(103,232,249,0.04) 100%)',
                    border: `2px solid ${CYAN}40`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
                }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: CYAN, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
                        Answer
                    </span>
                    <div style={{ fontSize: 'clamp(14px,2vw,18px)', fontWeight: 600, textAlign: 'center', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                        {card.answer}
                    </div>
                </div>
            </div>

            {showDeleteBtn && onDelete && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                        <FiTrash2 size={12} /> Delete Card
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────
const FlashcardsPage: React.FC = () => {
    const navigate = useNavigate();
    const { sets, activeSetId, addSet, deleteSet, deleteCard, setActiveSet } = useFlashcardsStore();
    const [tab, setTab] = useState<Tab>('generate');

    // Generate tab state
    const [notes, setNotes] = useState('');
    const [cardCount, setCardCount] = useState(12);
    const [genLoading, setGenLoading] = useState(false);
    const [genError, setGenError] = useState<string | null>(null);
    const [setName, setSetName] = useState('');

    // Review tab state
    const [cardIndex, setCardIndex] = useState(0);

    // Study mode state
    const [studyIndex, setStudyIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [score, setScore] = useState({ correct: 0, incorrect: 0 });
    const [studyDone, setStudyDone] = useState(false);
    const [studyResults, setStudyResults] = useState<boolean[]>([]);

    const activeSet = sets.find(s => s.id === activeSetId) ?? null;

    // Reset card index when set changes
    useEffect(() => {
        setCardIndex(0);
        setStudyIndex(0);
        setStudyDone(false);
        setScore({ correct: 0, incorrect: 0 });
        setStudyResults([]);
        setRevealed(false);
    }, [activeSetId]);

    const handleGenerate = useCallback(async () => {
        setGenError(null);
        if (!notes.trim()) { setGenError('Paste or type some notes first.'); return; }

        setGenLoading(true);
        try {
            const cards = await generateFlashcards(notes, undefined, cardCount);
            const name = setName.trim() || `Flashcard Set ${new Date().toLocaleDateString('en-IN')}`;
            addSet(name, cards);
            setTab('review');
            setCardIndex(0);
        } catch (err) {
            setGenError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setGenLoading(false);
        }
    }, [notes, cardCount, setName, addSet]);

    // Study mode handlers
    const studyCard = activeSet?.cards[studyIndex] ?? null;

    const handleStudyReveal = () => setRevealed(true);

    const handleStudyMark = (correct: boolean) => {
        const results = [...studyResults, correct];
        setStudyResults(results);
        setScore(s => ({ correct: s.correct + (correct ? 1 : 0), incorrect: s.incorrect + (correct ? 0 : 1) }));
        if (studyIndex + 1 >= (activeSet?.cards.length ?? 0)) {
            setStudyDone(true);
        } else {
            setStudyIndex(i => i + 1);
            setRevealed(false);
        }
    };

    const resetStudy = () => {
        setStudyIndex(0);
        setStudyDone(false);
        setScore({ correct: 0, incorrect: 0 });
        setStudyResults([]);
        setRevealed(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fc-card-anim { animation: fadeIn 0.3s ease; }
                .fc-sets-item:hover { background: var(--surface-2) !important; }
                .fc-tab-btn:hover { background: var(--surface-2) !important; }
                textarea.fc-notes { resize: vertical; }
                .fc-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(124,58,237,0.55) !important; }
                .fc-btn-ghost:hover { background: rgba(255,255,255,0.06) !important; }
            `}</style>

            {/* ── Header ── */}
            <header style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '0 24px', height: '58px', borderBottom: '1px solid var(--border)',
                background: 'var(--surface)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 20,
            }}>
                <button
                    onClick={() => navigate('/canvas')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', padding: '6px 10px', borderRadius: '8px', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                    <FiArrowLeft size={15} /> Back to Canvas
                </button>

                <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

                <span style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiZap style={{ color: VIOLET }} /> AI Flashcards
                </span>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginLeft: '20px', background: 'var(--surface-2)', padding: '4px', borderRadius: '10px' }}>
                    {([
                        { key: 'generate', label: 'Generate', icon: <FiZap size={13} /> },
                        { key: 'review', label: 'Review Cards', icon: <FiBook size={13} /> },
                        { key: 'study', label: 'Study Mode', icon: <FiStar size={13} /> },
                    ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} className="fc-tab-btn" style={{
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

                {/* Active set info */}
                {activeSet && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {activeSet.name} — <strong style={{ color: VIOLET }}>{activeSet.cards.length}</strong> cards
                        </span>
                        {activeSet.cards.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={() => exportCSV(activeSet.cards, activeSet.name)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <FiDownload size={12} /> CSV
                                </button>
                                <button
                                    onClick={() => exportPDF(activeSet.cards, activeSet.name)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <FiDownload size={12} /> PDF
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* ── Body ── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* ── Sets Sidebar ── */}
                <aside style={{
                    width: '220px', flexShrink: 0, borderRight: '1px solid var(--border)',
                    background: 'var(--surface)', overflowY: 'auto', padding: '12px',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 6px', marginBottom: '4px' }}>
                        Saved Sets
                    </div>
                    {sets.length === 0 && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '6px', fontStyle: 'italic' }}>
                            No sets yet. Generate your first!
                        </p>
                    )}
                    {sets.map(s => (
                        <div
                            key={s.id}
                            className="fc-sets-item"
                            onClick={() => { setActiveSet(s.id); setCardIndex(0); }}
                            style={{
                                padding: '10px 10px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                border: `1px solid ${s.id === activeSetId ? VIOLET + '50' : 'transparent'}`,
                                background: s.id === activeSetId ? `${VIOLET}12` : 'transparent',
                                transition: 'all 0.15s',
                            }}
                        >
                            <div style={{ fontSize: '13px', fontWeight: 600, color: s.id === activeSetId ? VIOLET : 'var(--text-primary)', wordBreak: 'break-word' }}>
                                {s.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                                {s.cards.length} cards
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); if (confirm(`Delete "${s.name}"?`)) deleteSet(s.id); }}
                                style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '11px', padding: '2px 0' }}
                            >
                                <FiTrash2 size={11} /> Delete
                            </button>
                        </div>
                    ))}
                </aside>

                {/* ── Main Content ── */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

                    {/* ═══════════════════════════════════════
                        TAB 1 — GENERATE
                    ═══════════════════════════════════════ */}
                    {tab === 'generate' && (
                        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Hero */}
                            <div style={{
                                borderRadius: '18px', padding: '28px 32px',
                                background: 'linear-gradient(135deg,rgba(124,58,237,0.18) 0%,rgba(124,58,237,0.06) 100%)',
                                border: `1px solid ${VIOLET}30`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '24px' }}>⚡</span>
                                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>AI Notes to Flashcards</h2>
                                    <span style={{ padding: '3px 10px', borderRadius: '999px', background: `${VIOLET}20`, color: VIOLET, border: `1px solid ${VIOLET}40`, fontSize: '11px', fontWeight: 800 }}>Powered by Groq</span>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                                    Paste your notes below and AI will instantly generate study flashcards with Question, Answer and Topic tags. Works with typed notes, pasted text, or lecture summaries.
                                </p>
                            </div>

                            {/* Notes input */}
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Your Notes</label>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{notes.length} chars</span>
                                </div>
                                <textarea
                                    className="fc-notes"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder={"Paste or type your notes here...\n\nExample:\nPhotosynthesis is the process by which plants use sunlight, water and CO2 to produce oxygen and energy in the form of sugar.\n\nMitosis is cell division that results in two daughter cells with the same number of chromosomes as the parent cell."}
                                    style={{ ...inputStyle, minHeight: '200px', fontFamily: 'inherit', lineHeight: 1.65, fontSize: '14px' }}
                                />

                                {/* Options row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Set Name (optional)</label>
                                        <input
                                            value={setName}
                                            onChange={e => setSetName(e.target.value)}
                                            placeholder="e.g. Biology Chapter 5"
                                            style={{ ...inputStyle, width: '220px', fontSize: '13px', padding: '7px 10px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                            Cards to generate — <span style={{ color: VIOLET }}>{cardCount}</span>
                                        </label>
                                        <input
                                            type="range" min={5} max={20} value={cardCount}
                                            onChange={e => setCardCount(+e.target.value)}
                                            style={{ accentColor: VIOLET, width: '160px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error */}
                            {genError && (
                                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiAlertTriangle size={15} /> {genError}
                                </div>
                            )}

                            {/* Generate Button */}
                            <button
                                className="fc-btn-primary"
                                onClick={handleGenerate}
                                disabled={genLoading}
                                style={{
                                    padding: '15px', borderRadius: '12px', border: 'none',
                                    background: genLoading ? 'var(--surface-2)' : `linear-gradient(135deg,${VIOLET},#6d28d9)`,
                                    color: genLoading ? 'var(--text-muted)' : 'white',
                                    cursor: genLoading ? 'default' : 'pointer',
                                    fontWeight: 800, fontSize: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                    boxShadow: genLoading ? 'none' : '0 8px 24px rgba(124,58,237,0.4)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {genLoading
                                    ? <><FiRefreshCw size={17} style={{ animation: 'spin 1s linear infinite' }} /> Generating with AI...</>
                                    : <><FiZap size={17} /> Generate Flashcards</>
                                }
                            </button>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════
                        TAB 2 — REVIEW
                    ═══════════════════════════════════════ */}
                    {tab === 'review' && (
                        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
                            {!activeSet || activeSet.cards.length === 0 ? (
                                <EmptyState onGenerate={() => setTab('generate')} />
                            ) : (
                                <>
                                    {/* Card counter */}
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                            Card {cardIndex + 1} / {activeSet.cards.length}
                                        </span>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {[...new Set(activeSet.cards.map(c => c.tag))].slice(0, 5).map(tag => (
                                                <span key={tag} style={{ padding: '3px 9px', borderRadius: '999px', background: `${VIOLET}15`, color: VIOLET, border: `1px solid ${VIOLET}30`, fontSize: '11px', fontWeight: 600 }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div style={{ width: '100%', height: '4px', background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{ width: `${((cardIndex + 1) / activeSet.cards.length) * 100}%`, height: '100%', background: VIOLET, borderRadius: '999px', transition: 'width 0.3s ease' }} />
                                    </div>

                                    {/* Flip Card */}
                                    <div className="fc-card-anim" style={{ width: '100%' }}>
                                        <FlipCard
                                            card={activeSet.cards[cardIndex]}
                                            onDelete={() => {
                                                deleteCard(activeSet.id, activeSet.cards[cardIndex].id);
                                                setCardIndex(i => Math.min(i, activeSet.cards.length - 2));
                                            }}
                                        />
                                    </div>

                                    {/* Prev / Next */}
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <button
                                            onClick={() => setCardIndex(i => Math.max(0, i - 1))}
                                            disabled={cardIndex === 0}
                                            style={{ ...navBtnStyle, opacity: cardIndex === 0 ? 0.4 : 1 }}
                                        >
                                            <FiChevronLeft size={20} /> Prev
                                        </button>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {activeSet.cards.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCardIndex(i)}
                                                    style={{
                                                        width: '8px', height: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
                                                        background: i === cardIndex ? VIOLET : 'var(--surface-2)',
                                                        transition: 'background 0.2s',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCardIndex(i => Math.min(activeSet.cards.length - 1, i + 1))}
                                            disabled={cardIndex === activeSet.cards.length - 1}
                                            style={{ ...navBtnStyle, opacity: cardIndex === activeSet.cards.length - 1 ? 0.4 : 1 }}
                                        >
                                            Next <FiChevronRight size={20} />
                                        </button>
                                    </div>

                                    {/* Card list below */}
                                    <div style={{ width: '100%' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-muted)' }}>All Cards</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {activeSet.cards.map((card, i) => (
                                                <div key={card.id} onClick={() => setCardIndex(i)} style={{
                                                    padding: '12px 16px', borderRadius: '10px',
                                                    border: `1px solid ${i === cardIndex ? VIOLET + '50' : 'var(--border)'}`,
                                                    background: i === cardIndex ? `${VIOLET}08` : 'var(--surface)',
                                                    cursor: 'pointer', transition: 'all 0.15s',
                                                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                                                }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', minWidth: '24px' }}>#{i + 1}</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{card.question}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{card.tag}</div>
                                                    </div>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); deleteCard(activeSet.id, card.id); if (cardIndex >= i) setCardIndex(Math.max(0, cardIndex - 1)); }}
                                                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                                                    >
                                                        <FiTrash2 size={13} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ═══════════════════════════════════════
                        TAB 3 — STUDY MODE
                    ═══════════════════════════════════════ */}
                    {tab === 'study' && (
                        <div style={{ maxWidth: '620px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                            {!activeSet || activeSet.cards.length === 0 ? (
                                <EmptyState onGenerate={() => setTab('generate')} />
                            ) : studyDone ? (
                                // Results screen
                                <div className="fc-card-anim" style={{ width: '100%', textAlign: 'center', padding: '48px 32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px' }}>
                                    <div style={{ fontSize: '52px', marginBottom: '16px' }}>
                                        {score.correct / activeSet.cards.length >= 0.8 ? '🎉' : score.correct / activeSet.cards.length >= 0.5 ? '👍' : '💪'}
                                    </div>
                                    <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800 }}>Study Session Complete!</h2>
                                    <p style={{ color: 'var(--text-muted)', margin: '0 0 24px', fontSize: '15px' }}>
                                        You reviewed all {activeSet.cards.length} cards.
                                    </p>
                                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '28px' }}>
                                        <div style={{ padding: '16px 28px', borderRadius: '12px', background: 'rgba(134,239,172,0.12)', border: '1px solid rgba(134,239,172,0.3)' }}>
                                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#86efac' }}>{score.correct}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Correct</div>
                                        </div>
                                        <div style={{ padding: '16px 28px', borderRadius: '12px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)' }}>
                                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#f87171' }}>{score.incorrect}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Incorrect</div>
                                        </div>
                                        <div style={{ padding: '16px 28px', borderRadius: '12px', background: `${VIOLET}12`, border: `1px solid ${VIOLET}30` }}>
                                            <div style={{ fontSize: '32px', fontWeight: 800, color: VIOLET }}>
                                                {Math.round((score.correct / activeSet.cards.length) * 100)}%
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Score</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={resetStudy}
                                        style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg,${VIOLET},#6d28d9)`, color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(124,58,237,0.4)' }}
                                    >
                                        <FiRefreshCw size={15} /> Study Again
                                    </button>
                                </div>
                            ) : (
                                // Study card
                                <>
                                    {/* Progress */}
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                            {studyIndex + 1} / {activeSet.cards.length}
                                        </span>
                                        <span style={{ fontSize: '13px', color: GREEN }}>✓ {score.correct}  <span style={{ color: '#f87171' }}>✗ {score.incorrect}</span></span>
                                    </div>
                                    <div style={{ width: '100%', height: '4px', background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{ width: `${(studyIndex / activeSet.cards.length) * 100}%`, height: '100%', background: `linear-gradient(90deg,${VIOLET},${CYAN})`, borderRadius: '999px', transition: 'width 0.3s ease' }} />
                                    </div>

                                    {studyCard && (
                                        <div className="fc-card-anim" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {/* Question card */}
                                            <div style={{
                                                borderRadius: '18px', padding: '32px 28px', textAlign: 'center',
                                                background: `linear-gradient(135deg,${VIOLET}18,${VIOLET}06)`,
                                                border: `2px solid ${VIOLET}35`,
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
                                            }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: VIOLET, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{studyCard.tag}</span>
                                                <div style={{ fontSize: 'clamp(16px,2.5vw,22px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                                                    {studyCard.question}
                                                </div>
                                            </div>

                                            {!revealed ? (
                                                <button
                                                    onClick={handleStudyReveal}
                                                    style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${CYAN}40`, background: `${CYAN}10`, color: CYAN, cursor: 'pointer', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = `${CYAN}20`)}
                                                    onMouseLeave={e => (e.currentTarget.style.background = `${CYAN}10`)}
                                                >
                                                    <FiBook size={16} /> Show Answer
                                                </button>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {/* Answer card */}
                                                    <div style={{
                                                        borderRadius: '14px', padding: '20px 24px', textAlign: 'center',
                                                        background: `${CYAN}0c`, border: `1px solid ${CYAN}30`,
                                                        fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.55,
                                                    }}>
                                                        {studyCard.answer}
                                                    </div>

                                                    {/* Mark buttons */}
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button
                                                            onClick={() => handleStudyMark(false)}
                                                            style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '2px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.1)', color: '#f87171', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'all 0.15s' }}
                                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.2)')}
                                                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                                                        >
                                                            <FiX size={16} /> Got it Wrong
                                                        </button>
                                                        <button
                                                            onClick={() => handleStudyMark(true)}
                                                            style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '2px solid rgba(134,239,172,0.4)', background: 'rgba(134,239,172,0.1)', color: '#86efac', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'all 0.15s' }}
                                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(134,239,172,0.2)')}
                                                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(134,239,172,0.1)')}
                                                        >
                                                            <FiCheck size={16} /> Got it Right
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
    );
};

// ── Sub-components ─────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
    padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s',
};

const navBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '9px 18px', borderRadius: '10px',
    border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
    transition: 'all 0.15s',
};

const EmptyState: React.FC<{ onGenerate: () => void }> = ({ onGenerate }) => (
    <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px',
        padding: '60px 32px', textAlign: 'center', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
    }}>
        <FiZap size={48} style={{ color: VIOLET, opacity: 0.35 }} />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>No flashcards yet</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Generate a set from your notes to get started.
        </p>
        <button
            onClick={onGenerate}
            style={{ padding: '11px 24px', borderRadius: '10px', border: 'none', background: VIOLET, color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
        >
            <FiPlus size={15} /> Generate Flashcards
        </button>
    </div>
);

export default FlashcardsPage;
