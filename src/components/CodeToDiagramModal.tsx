import React, { useState } from 'react';
import { FiX, FiCpu, FiCode } from 'react-icons/fi';
import { useShapesStore } from '../store/shapesStore';
import { useThemeStore } from '../store/themeStore';
import { parseCodeToEntities } from '../utils/codeParser';
import { generateDiagramShapes } from '../utils/diagramGenerator';

interface CodeToDiagramModalProps {
    onClose: () => void;
}

const SUPPORTED_LANGS = ['TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'C++'];

const PLACEHOLDER = `# Python example
class User:
    id: int
    name: str
    email: str

class Order:
    order_id: int
    user: User
    total: float

# ── or paste TypeScript, Java, Go, Rust, C#, Swift, etc. ──
`;

const CodeToDiagramModal: React.FC<CodeToDiagramModalProps> = ({ onClose }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { addShape } = useShapesStore();
    const { theme } = useThemeStore();

    const handleGenerate = () => {
        if (!code.trim()) {
            setError('Please paste some code first.');
            return;
        }

        try {
            const entities = parseCodeToEntities(code);
            if (entities.length === 0) {
                setError('No classes, structs, or interfaces were detected. Make sure your code defines at least one.');
                return;
            }

            const shapes = generateDiagramShapes(entities, 100, 100, theme);
            shapes.forEach(shape => addShape(shape));
            onClose();
        } catch (err) {
            console.error('Error generating diagram:', err);
            setError('Failed to generate diagram. Please check your code syntax.');
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                zIndex: 1000, padding: '20px', overflowY: 'auto',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '18px', padding: '20px', width: '100%', maxWidth: '620px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    marginTop: 'auto', marginBottom: 'auto',
                    alignSelf: 'center',
                }}
            >
                {/* ── Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <FiCpu style={{ color: 'var(--violet)' }} />
                        Code → Diagram
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
                    >
                        <FiX />
                    </button>
                </div>

                {/* ── Description ── */}
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                    Paste code in <strong style={{ color: 'var(--text-primary)' }}>any language</strong> and we'll extract classes, structs, and interfaces into UML-style boxes on your canvas.
                </p>

                {/* ── Language pill list (single scrollable row) ── */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', flexShrink: 0 }}>
                    {SUPPORTED_LANGS.map(lang => (
                        <span key={lang} style={{
                            display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
                            padding: '3px 10px', borderRadius: '999px', fontSize: '11px',
                            background: 'var(--surface-2)', color: 'var(--text-muted)',
                            border: '1px solid var(--border)', flexShrink: 0,
                        }}>
                            <FiCode size={10} />
                            {lang}
                        </span>
                    ))}
                </div>

                {/* ── Code textarea ── */}
                <textarea
                    value={code}
                    onChange={e => { setCode(e.target.value); setError(null); }}
                    placeholder={PLACEHOLDER}
                    spellCheck={false}
                    style={{
                        width: '100%', height: '180px', padding: '12px',
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', borderRadius: '10px',
                        fontFamily: '"Fira Code", "Cascadia Code", monospace',
                        fontSize: '13px', lineHeight: '1.6', resize: 'vertical',
                        outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'var(--violet)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />

                {/* ── Error ── */}
                {error && (
                    <div style={{
                        color: '#f87171', fontSize: '13px', padding: '10px 14px',
                        background: 'rgba(248,113,113,0.1)', borderRadius: '8px',
                        border: '1px solid rgba(248,113,113,0.25)',
                    }}>
                        {error}
                    </div>
                )}

                {/* ── Actions ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
                    <button onClick={onClose} style={{
                        padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border)',
                        background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500,
                    }}>
                        Cancel
                    </button>
                    <button onClick={handleGenerate} style={{
                        padding: '10px 22px', borderRadius: '8px', border: 'none',
                        background: 'var(--violet)', color: 'white', cursor: 'pointer',
                        fontWeight: 600, fontSize: '14px',
                        boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
                        transition: 'opacity 0.15s',
                    }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        Generate Diagram
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CodeToDiagramModal;
