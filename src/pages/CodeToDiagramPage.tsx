import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiCpu, FiCode, FiCheck, FiAlertCircle,
    FiDownload, FiPlusSquare, FiLayout, FiSave,
} from 'react-icons/fi';
import { useShapesStore } from '../store/shapesStore';
import { useThemeStore } from '../store/themeStore';
import { useBoardStore } from '../store/boardStore';
import { exportJSON } from '../utils/saveLoad';
import { parseCodeToEntities, type ParsedEntity } from '../utils/codeParser';
import { generateDiagramShapes } from '../utils/diagramGenerator';

// ────────────────────────────────────────────────────────────
const SUPPORTED_LANGS = [
    'TypeScript', 'JavaScript', 'Python', 'Java', 'C#',
    'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'C++',
];

const EXAMPLES: Record<string, { label: string; code: string }> = {
    typescript: {
        label: 'TypeScript',
        code: `interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

class ProductService {
  products: Product[];
  taxRate: number;
  currency: string;
}

class Order {
  orderId: string;
  user: User;
  total: number;
  status: string;
}`,
    },
    python: {
        label: 'Python',
        code: `class Animal:
    name: str
    age: int
    species: str

class Dog(Animal):
    breed: str
    trained: bool
    owner: str

class Cat(Animal):
    indoor: bool
    color: str`,
    },
    java: {
        label: 'Java',
        code: `public class Person {
    private String name;
    private int age;
    private String email;
}

public class Employee extends Person {
    private String department;
    private double salary;
    private String role;
}`,
    },
    go: {
        label: 'Go',
        code: `type Server struct {
    Host    string
    Port    int
    Timeout int
    Debug   bool
}

type Database struct {
    DSN      string
    PoolSize int
    Timeout  int
}`,
    },
    rust: {
        label: 'Rust',
        code: `pub struct Config {
    host: String,
    port: u16,
    debug: bool,
}

pub struct AppState {
    config: Config,
    version: String,
    uptime: u64,
}`,
    },
};

const kindColor: Record<string, string> = {
    class: '#a78bfa',
    interface: '#67e8f9',
    struct: '#86efac',
    enum: '#fda4af',
};

// ────────────────────────────────────────────────────────────
type ActionState = 'idle' | 'loading' | 'done';

const CodeToDiagramPage: React.FC = () => {
    const navigate = useNavigate();
    const { addShape } = useShapesStore();
    const { theme } = useThemeStore();
    const { createBoard, updateBoardShapes, setActiveBoard } = useBoardStore();

    const [code, setCode] = useState('');
    const [entities, setEntities] = useState<ParsedEntity[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [activeExample, setActiveExample] = useState<string | null>(null);

    // Separate feedback states per action
    const [addState, setAddState] = useState<ActionState>('idle');
    const [saveFileState, setSaveFileState] = useState<ActionState>('idle');
    const [newBoardState, setNewBoardState] = useState<ActionState>('idle');

    // Board name input for "save as new board"
    const [boardName, setBoardName] = useState('');
    const [showBoardInput, setShowBoardInput] = useState(false);

    // ── Parse ──────────────────────────────────────────────
    const handleParse = useCallback((): ParsedEntity[] | null => {
        setError(null);
        if (!code.trim()) { setError('Please paste some code first.'); return null; }
        try {
            const parsed = parseCodeToEntities(code);
            if (parsed.length === 0) {
                setError('No classes, structs, or interfaces detected. Make sure your code defines at least one.');
                setEntities([]);
                return null;
            }
            setEntities(parsed);
            return parsed;
        } catch {
            setError('Parse error — check your code syntax.');
            return null;
        }
    }, [code]);

    const getEntities = useCallback((): ParsedEntity[] | null => {
        return entities.length > 0 ? entities : handleParse();
    }, [entities, handleParse]);

    // ── Action 1: Add to current canvas board ─────────────
    const handleAddToCanvas = useCallback(() => {
        const ents = getEntities();
        if (!ents) return;
        setAddState('loading');
        const shapes = generateDiagramShapes(ents, 100, 100, theme);
        shapes.forEach(s => addShape(s));
        setAddState('done');
        setTimeout(() => { setAddState('idle'); navigate('/canvas'); }, 1500);
    }, [getEntities, theme, addShape, navigate]);

    // ── Action 2: Save diagram as .antigravity file ────────
    const handleSaveFile = useCallback(() => {
        const ents = getEntities();
        if (!ents) return;
        setSaveFileState('loading');
        const shapes = generateDiagramShapes(ents, 100, 100, theme);
        const name = ents.map(e => e.name).join('_') || 'diagram';
        exportJSON(shapes, name);
        setSaveFileState('done');
        setTimeout(() => setSaveFileState('idle'), 2000);
    }, [getEntities, theme]);

    // ── Action 3: Save as a brand-new board ───────────────
    const handleSaveAsBoard = useCallback(() => {
        const ents = getEntities();
        if (!ents) return;
        const name = boardName.trim() || `Diagram — ${ents.map(e => e.name).slice(0, 2).join(', ')}`;
        setNewBoardState('loading');
        const shapes = generateDiagramShapes(ents, 100, 100, theme);
        const board = createBoard(name);
        updateBoardShapes(board.id, shapes);
        setActiveBoard(board.id);
        setNewBoardState('done');
        setShowBoardInput(false);
        setTimeout(() => { setNewBoardState('idle'); navigate('/canvas'); }, 1500);
    }, [getEntities, theme, boardName, createBoard, updateBoardShapes, setActiveBoard, navigate]);

    const loadExample = (key: string) => {
        setCode(EXAMPLES[key].code);
        setEntities([]);
        setError(null);
        setAddState('idle'); setSaveFileState('idle'); setNewBoardState('idle');
        setActiveExample(key);
    };

    // ────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>

            {/* ── Sticky top bar ── */}
            <header style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '0 24px', height: '58px', borderBottom: '1px solid var(--border)',
                background: 'var(--surface)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10,
            }}>
                <button onClick={() => navigate('/canvas')} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', background: 'none',
                    border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px',
                    padding: '6px 10px', borderRadius: '8px',
                }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                    <FiArrowLeft size={16} /> Back to Canvas
                </button>

                <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

                <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCpu style={{ color: 'var(--violet)' }} />
                    Code → Diagram
                </h1>

                {/* Language pills */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', overflowX: 'auto' }}>
                    {SUPPORTED_LANGS.map(l => (
                        <span key={l} style={{
                            whiteSpace: 'nowrap', padding: '2px 8px', borderRadius: '999px',
                            fontSize: '11px', background: 'var(--surface-2)',
                            color: 'var(--text-muted)', border: '1px solid var(--border)',
                        }}>{l}</span>
                    ))}
                </div>
            </header>

            {/* ── Two-column body ── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* LEFT — Editor */}
                <div style={{ width: '55%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>

                    {/* Example buttons */}
                    <div style={{
                        padding: '10px 20px', borderBottom: '1px solid var(--border)',
                        display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap',
                        background: 'var(--surface)',
                    }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '4px' }}>Try example:</span>
                        {Object.entries(EXAMPLES).map(([key, ex]) => (
                            <button key={key} onClick={() => loadExample(key)} style={{
                                padding: '4px 12px', borderRadius: '999px', fontSize: '12px',
                                border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500,
                                background: activeExample === key ? 'var(--violet)' : 'var(--surface-2)',
                                color: activeExample === key ? 'white' : 'var(--text-primary)',
                                transition: 'all 0.15s',
                            }}>
                                {ex.label}
                            </button>
                        ))}
                    </div>

                    {/* Textarea */}
                    <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            <FiCode size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Paste your code
                        </label>
                        <textarea
                            value={code}
                            onChange={e => { setCode(e.target.value); setEntities([]); setError(null); setAddState('idle'); setSaveFileState('idle'); setNewBoardState('idle'); }}
                            placeholder={`Paste any code here — Python, TypeScript, Java, Go, Rust, C#, Swift, Kotlin, PHP, Ruby, C++...\n\nExample (Python):\nclass User:\n    id: int\n    name: str\n    email: str`}
                            spellCheck={false}
                            style={{
                                flex: 1, minHeight: '340px', padding: '16px',
                                background: 'var(--surface-2)', border: '1px solid var(--border)',
                                color: 'var(--text-primary)', borderRadius: '12px',
                                fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
                                fontSize: '13px', lineHeight: '1.7', resize: 'vertical',
                                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                            }}
                            onFocus={e => (e.target.style.borderColor = 'var(--violet)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                        />

                        {/* Error */}
                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 14px', background: 'rgba(248,113,113,0.1)',
                                borderRadius: '8px', border: '1px solid rgba(248,113,113,0.25)',
                                color: '#f87171', fontSize: '13px',
                            }}>
                                <FiAlertCircle size={15} /> {error}
                            </div>
                        )}

                        {/* Parse button */}
                        <button onClick={() => handleParse()} style={{
                            padding: '11px', borderRadius: '10px',
                            border: '1px solid var(--border)', background: 'var(--surface-2)',
                            color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600,
                            fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                        >
                            <FiCode size={15} /> Parse Code
                        </button>

                        {/* ── Action buttons (only shown when entities exist) ── */}
                        {entities.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    Choose an action
                                </p>

                                {/* 1. Add to current canvas board */}
                                <button onClick={handleAddToCanvas} disabled={addState === 'done'} style={{
                                    padding: '12px 16px', borderRadius: '10px', border: 'none',
                                    cursor: addState === 'done' ? 'default' : 'pointer', fontWeight: 700,
                                    fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
                                    background: addState === 'done' ? '#22c55e' : 'var(--violet)',
                                    color: 'white',
                                    boxShadow: addState === 'done' ? '0 4px 16px rgba(34,197,94,0.35)' : '0 4px 20px rgba(124,58,237,0.4)',
                                    transition: 'all 0.2s',
                                }}>
                                    {addState === 'done' ? <FiCheck size={16} /> : <FiLayout size={16} />}
                                    <div style={{ textAlign: 'left' }}>
                                        <div>{addState === 'done' ? 'Added! Heading to canvas…' : 'Add to Current Board'}</div>
                                        <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.8 }}>Places shapes on your active canvas board</div>
                                    </div>
                                </button>

                                {/* 2. Save as file */}
                                <button onClick={handleSaveFile} disabled={saveFileState === 'done'} style={{
                                    padding: '12px 16px', borderRadius: '10px',
                                    border: '1px solid var(--border)', cursor: saveFileState === 'done' ? 'default' : 'pointer',
                                    fontWeight: 700, fontSize: '14px',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    background: saveFileState === 'done' ? 'rgba(34,197,94,0.15)' : 'var(--surface-2)',
                                    color: saveFileState === 'done' ? '#22c55e' : 'var(--text-primary)',
                                    transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => { if (saveFileState !== 'done') e.currentTarget.style.background = 'var(--border)'; }}
                                    onMouseLeave={e => { if (saveFileState !== 'done') e.currentTarget.style.background = 'var(--surface-2)'; }}
                                >
                                    {saveFileState === 'done' ? <FiCheck size={16} /> : <FiDownload size={16} />}
                                    <div style={{ textAlign: 'left' }}>
                                        <div>{saveFileState === 'done' ? 'Downloaded!' : 'Save Diagram as File'}</div>
                                        <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.7 }}>Downloads a .antigravity file you can import later</div>
                                    </div>
                                </button>

                                {/* 3. Save as new board */}
                                {!showBoardInput ? (
                                    <button onClick={() => setShowBoardInput(true)} style={{
                                        padding: '12px 16px', borderRadius: '10px',
                                        border: '1px solid var(--border)', cursor: 'pointer',
                                        fontWeight: 700, fontSize: '14px',
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        background: 'var(--surface-2)', color: 'var(--text-primary)',
                                        transition: 'all 0.2s',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                                    >
                                        <FiPlusSquare size={16} />
                                        <div style={{ textAlign: 'left' }}>
                                            <div>Save as New Board</div>
                                            <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.7 }}>Creates a dedicated canvas board for this diagram</div>
                                        </div>
                                    </button>
                                ) : (
                                    <div style={{
                                        padding: '14px', borderRadius: '10px',
                                        border: '1px solid var(--violet)', background: 'var(--surface-2)',
                                        display: 'flex', flexDirection: 'column', gap: '10px',
                                    }}>
                                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                            <FiSave size={12} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                            Board name
                                        </label>
                                        <input
                                            autoFocus
                                            value={boardName}
                                            onChange={e => setBoardName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleSaveAsBoard(); if (e.key === 'Escape') setShowBoardInput(false); }}
                                            placeholder={`Diagram — ${entities.map(e => e.name).slice(0, 2).join(', ')}`}
                                            style={{
                                                padding: '9px 12px', borderRadius: '8px',
                                                border: '1px solid var(--border)', background: 'var(--bg)',
                                                color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => setShowBoardInput(false)} style={{
                                                flex: 1, padding: '9px', borderRadius: '8px',
                                                border: '1px solid var(--border)', background: 'transparent',
                                                color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500,
                                            }}>Cancel</button>
                                            <button onClick={handleSaveAsBoard} disabled={newBoardState === 'done'} style={{
                                                flex: 2, padding: '9px', borderRadius: '8px', border: 'none',
                                                background: newBoardState === 'done' ? '#22c55e' : 'var(--violet)',
                                                color: 'white', cursor: newBoardState === 'done' ? 'default' : 'pointer',
                                                fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                            }}>
                                                {newBoardState === 'done' ? <><FiCheck size={14} /> Saved! Opening…</> : <><FiSave size={14} /> Create Board</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT — Preview panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{
                        padding: '14px 20px', borderBottom: '1px solid var(--border)',
                        background: 'var(--surface)', fontSize: '13px', fontWeight: 600,
                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <FiCpu size={14} />
                        Detected Entities
                        {entities.length > 0 && (
                            <span style={{
                                marginLeft: '4px', padding: '2px 8px', borderRadius: '999px',
                                background: 'var(--violet)', color: 'white', fontSize: '11px', fontWeight: 700,
                            }}>{entities.length}</span>
                        )}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {entities.length === 0 ? (
                            <div style={{
                                flex: 1, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '12px',
                                color: 'var(--text-muted)', textAlign: 'center', padding: '40px',
                            }}>
                                <FiCpu size={40} style={{ opacity: 0.25 }} />
                                <p style={{ margin: 0, fontSize: '14px' }}>
                                    Paste code on the left and click <strong>Parse Code</strong> to preview detected entities here.
                                    Then choose an action to add or save the diagram.
                                </p>
                            </div>
                        ) : (
                            entities.map((entity, i) => (
                                <div key={i} style={{
                                    border: `1px solid ${kindColor[entity.kind] ?? 'var(--border)'}`,
                                    borderRadius: '12px', overflow: 'hidden', background: 'var(--surface)',
                                }}>
                                    <div style={{
                                        padding: '10px 14px',
                                        background: `${kindColor[entity.kind] ?? '#a78bfa'}18`,
                                        borderBottom: `1px solid ${kindColor[entity.kind] ?? 'var(--border)'}40`,
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}>
                                        <span style={{
                                            fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
                                            border: `1px solid ${kindColor[entity.kind] ?? '#a78bfa'}`,
                                            color: kindColor[entity.kind] ?? '#a78bfa',
                                        }}>«{entity.kind}»</span>
                                        <span style={{ fontWeight: 700, fontSize: '15px', color: kindColor[entity.kind] ?? 'var(--text-primary)' }}>
                                            {entity.name}
                                        </span>
                                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
                                            {entity.properties.length} field{entity.properties.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div style={{ padding: '8px 0' }}>
                                        {entity.properties.length === 0 ? (
                                            <div style={{ padding: '6px 14px', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>(no fields)</div>
                                        ) : entity.properties.map((prop, pi) => (
                                            <div key={pi} style={{
                                                padding: '5px 14px', fontSize: '13px',
                                                fontFamily: '"Fira Code", monospace', color: 'var(--text-primary)',
                                                borderBottom: pi < entity.properties.length - 1 ? '1px solid var(--border)' : 'none',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                            }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '2px', flexShrink: 0, background: kindColor[entity.kind] ?? '#a78bfa', opacity: 0.6 }} />
                                                {prop}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeToDiagramPage;
