import React, { useState } from 'react';
import { FiX, FiCpu } from 'react-icons/fi';
import { useShapesStore } from '../store/shapesStore';
import { useThemeStore } from '../store/themeStore';
import { parseCodeToEntities } from '../utils/codeParser';
import { generateDiagramShapes } from '../utils/diagramGenerator';

interface CodeToDiagramModalProps {
    onClose: () => void;
}

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
                setError('No valid classes or interfaces found in the code.');
                return;
            }

            // Generate shapes starting at coordinates (100, 100)
            const shapes = generateDiagramShapes(entities, 100, 100, theme);

            // Add all shapes to the board
            shapes.forEach(shape => addShape(shape));

            onClose();
        } catch (err) {
            console.error('Error generating diagram:', err);
            setError('Failed to generate diagram. Please check your code syntax.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '600px',
                boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <FiCpu style={{ color: 'var(--violet)' }} />
                        Code → Diagram Converter
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>
                        <FiX />
                    </button>
                </div>

                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                    Paste your TypeScript/JavaScript classes or interfaces below. We will automatically generate UML-style blocks and place them on your canvas.
                </p>

                <textarea
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(null); }}
                    placeholder={`class User {\n    id: number;\n    name: string;\n    email: string;\n}`}
                    style={{
                        width: '100%', height: '200px', padding: '12px',
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', borderRadius: '8px',
                        fontFamily: 'monospace', fontSize: '14px', resize: 'vertical'
                    }}
                />

                {error && (
                    <div style={{ color: '#ef4444', fontSize: '14px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                    <button onClick={onClose} style={{
                        padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                        background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500
                    }}>
                        Cancel
                    </button>
                    <button onClick={handleGenerate} style={{
                        padding: '10px 20px', borderRadius: '8px', border: 'none',
                        background: 'var(--violet)', color: 'white', cursor: 'pointer', fontWeight: 600
                    }}>
                        Generate Diagram
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CodeToDiagramModal;
