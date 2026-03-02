import React, { useState, useRef } from 'react';
import { useBoardStore } from '../store/boardStore';
import { useShapesStore } from '../store/shapesStore';
import { exportPNG, exportSVG, exportPDF } from '../utils/exportImage';
import { exportJSON, importJSON } from '../utils/saveLoad';
import Konva from 'konva';
import {
    FiDownload, FiUpload, FiImage, FiCode, FiMenu, FiLogOut, FiUser, FiSun, FiMoon, FiFileText, FiCpu
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { signOut } from '../firebase/authService';
import { useNavigate } from 'react-router-dom';
import CodeToDiagramModal from './CodeToDiagramModal';

interface HeaderProps {
    onToggleSidebar: () => void;
    onOpenTemplates: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenTemplates }) => {
    const { activeBoardId, boards, renameBoard } = useBoardStore();
    const { shapes, loadShapes } = useShapesStore();
    const { user } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();
    const [isEditingName, setIsEditingName] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
    const importRef = useRef<HTMLInputElement>(null);

    const activeBoard = boards.find(b => b.id === activeBoardId);
    const boardName = activeBoard?.name ?? 'Untitled';

    const handleExportPNG = async () => {
        const stageRef = (window as unknown as Record<string, { current: Konva.Stage }>).__agStageRef;
        if (stageRef?.current) await exportPNG(stageRef.current, boardName);
        setExportOpen(false);
    };

    const handleExportSVG = async () => {
        const stageRef = (window as unknown as Record<string, { current: Konva.Stage }>).__agStageRef;
        if (stageRef?.current) await exportSVG(stageRef.current, boardName);
        setExportOpen(false);
    };

    const handleExportPDF = async () => {
        const stageRef = (window as unknown as Record<string, { current: Konva.Stage }>).__agStageRef;
        if (stageRef?.current) await exportPDF(stageRef.current, boardName);
        setExportOpen(false);
    };

    const handleExportJSON = () => {
        exportJSON(shapes, boardName);
        setExportOpen(false);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const imported = await importJSON(file);
            loadShapes(imported);
        } catch {
            alert('Invalid file format');
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="header-menu-btn" onClick={onToggleSidebar} id="btn-sidebar-toggle">
                    <FiMenu />
                </button>
                <div className="header-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Go to Homepage">
                    <span className="header-logo">✦</span>
                    <span className="header-name">Sketchbyte</span>
                </div>

                <div className="header-divider" />

                {isEditingName ? (
                    <input
                        className="board-name-input"
                        defaultValue={boardName}
                        autoFocus
                        onBlur={(e) => {
                            renameBoard(activeBoardId, e.target.value || boardName);
                            setIsEditingName(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                renameBoard(activeBoardId, e.currentTarget.value || boardName);
                                setIsEditingName(false);
                            }
                        }}
                    />
                ) : (
                    <button className="board-name-btn" onClick={() => setIsEditingName(true)} id="btn-board-name">
                        {boardName}
                    </button>
                )}
            </div>

            <div className="header-right">
                <button className="header-btn template-btn" onClick={onOpenTemplates} id="btn-templates">
                    <FiCode />
                    <span>Templates</span>
                </button>

                <label className="header-btn import-btn" title="Import JSON" htmlFor="import-file" id="btn-import">
                    <FiUpload />
                    <span>Import</span>
                    <input
                        id="import-file"
                        ref={importRef}
                        type="file"
                        accept=".antigravity,.json"
                        style={{ display: 'none' }}
                        onChange={handleImport}
                    />
                </label>

                <button className="header-btn" onClick={() => setIsDiagramModalOpen(true)} title="Generate Diagram from Code" id="btn-code-to-diagram">
                    <FiCpu />
                    <span>Code → Diagram</span>
                </button>

                <div className="export-wrapper">
                    <button
                        className="header-btn export-btn"
                        onClick={() => setExportOpen(!exportOpen)}
                        id="btn-export"
                    >
                        <FiDownload />
                        <span>Export</span>
                    </button>
                    {exportOpen && (
                        <div className="export-dropdown">
                            <button onClick={handleExportPNG} id="btn-export-png">
                                <FiImage /> Export PNG
                            </button>
                            <button onClick={handleExportSVG} id="btn-export-svg">
                                <FiImage /> Export SVG
                            </button>
                            <button onClick={handleExportPDF} id="btn-export-pdf">
                                <FiFileText /> Export PDF
                            </button>
                            <button onClick={handleExportJSON} id="btn-export-json">
                                <FiCode /> Save as JSON
                            </button>
                        </div>
                    )}
                </div>

                <div className="header-divider" />

                <button className="header-btn theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'dark' ? <FiSun /> : <FiMoon />}
                </button>

                <div className="header-user-profile">
                    <div className="header-avatar">
                        <FiUser />
                    </div>
                    <span className="header-user-name" title={user?.email || ''}>
                        {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <button className="header-btn logout-btn" onClick={() => signOut()} title="Sign Out">
                        <FiLogOut />
                    </button>
                </div>
            </div>

            {isDiagramModalOpen && (
                <CodeToDiagramModal onClose={() => setIsDiagramModalOpen(false)} />
            )}
        </header>
    );
};

export default Header;
