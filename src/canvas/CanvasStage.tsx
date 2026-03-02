import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Arrow, Text } from 'react-konva';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { useShapesStore } from '../store/shapesStore';
import { useToolStore } from '../store/toolStore';
import { useBoardStore } from '../store/boardStore';
import type { Shape, PencilShape, TextShape } from '../types';

interface CanvasStageProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
}

const GRID_SIZE = 40;

const CanvasStage: React.FC<CanvasStageProps> = ({ containerRef }) => {
    const stageRef = useRef<Konva.Stage>(null);
    const gridCanvasRef = useRef<HTMLCanvasElement>(null);
    const { shapes, addShape, updateShape, deleteShape, setSelectedIds, selectedIds } = useShapesStore();
    const { activeTool, strokeColor, fillColor, strokeWidth, roughness, opacity, fontSize, setActiveTool } = useToolStore();
    const { activeBoardId, updateBoardShapes } = useBoardStore();

    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPointer, setLastPointer] = useState({ x: 0, y: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentShapeId, setCurrentShapeId] = useState<string | null>(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    // Expose stageRef globally for export
    useEffect(() => {
        (window as unknown as Record<string, unknown>).__agStageRef = stageRef;
    }, []);

    // Resize handling
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setStageSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };
        handleResize();
        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [containerRef]);

    // Draw grid
    useEffect(() => {
        const canvas = gridCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = stageSize.width;
        canvas.height = stageSize.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        const startX = ((-offset.x / scale) % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
        const startY = ((-offset.y / scale) % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
        for (let x = startX * scale + offset.x; x < stageSize.width; x += GRID_SIZE * scale) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, stageSize.height); ctx.stroke();
        }
        for (let y = startY * scale + offset.y; y < stageSize.height; y += GRID_SIZE * scale) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(stageSize.width, y); ctx.stroke();
        }
    }, [stageSize, scale, offset]);

    // Auto-save on shape changes
    useEffect(() => {
        updateBoardShapes(activeBoardId, shapes);
    }, [shapes]); // eslint-disable-line react-hooks/exhaustive-deps

    // Keyboard shortcuts
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); useShapesStore.getState().undo(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); useShapesStore.getState().redo(); }
            if (e.key === 'Delete' || e.key === 'Backspace') useShapesStore.getState().deleteSelected();
            if (e.key === 'Escape') setSelectedIds([]);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [setSelectedIds]);

    const getWorldPos = useCallback(() => {
        const stage = stageRef.current;
        if (!stage) return { x: 0, y: 0 };
        const pointer = stage.getPointerPosition();
        if (!pointer) return { x: 0, y: 0 };
        return { x: (pointer.x - offset.x) / scale, y: (pointer.y - offset.y) / scale };
    }, [offset, scale]);

    const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;
        const scaleFactor = e.evt.deltaY < 0 ? 1.08 : 1 / 1.08;
        const newScale = Math.min(Math.max(scale * scaleFactor, 0.1), 5);
        setOffset({
            x: pointer.x - ((pointer.x - offset.x) / scale) * newScale,
            y: pointer.y - ((pointer.y - offset.y) / scale) * newScale,
        });
        setScale(newScale);
    }, [scale, offset]);

    const openTextEditor = useCallback((id: string, x: number, y: number, existingText: string) => {
        const stage = stageRef.current;
        if (!stage) return;
        const stageBox = stage.container().getBoundingClientRect();
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.value = existingText === 'Click to edit' ? '' : existingText;
        Object.assign(textarea.style, {
            position: 'fixed',
            top: `${stageBox.top + y * scale + offset.y}px`,
            left: `${stageBox.left + x * scale + offset.x}px`,
            minWidth: '120px', minHeight: '30px',
            padding: '4px 8px',
            border: '2px solid #a78bfa',
            borderRadius: '4px',
            background: '#1e1b4b',
            color: 'white',
            fontSize: `${fontSize * scale}px`,
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            zIndex: '9999',
        });
        textarea.focus();
        const finish = () => {
            const text = textarea.value.trim() || 'Text';
            updateShape(id, { text } as Partial<Shape>);
            if (document.body.contains(textarea)) document.body.removeChild(textarea);
            setActiveTool('select');
        };
        textarea.addEventListener('blur', finish);
        textarea.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') finish();
            if (evt.key === 'Enter' && !evt.shiftKey) { evt.preventDefault(); finish(); }
        });
    }, [scale, offset, fontSize, updateShape, setActiveTool]);

    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const pos = getWorldPos();
        if (activeTool === 'hand' || e.evt.button === 1) {
            setIsPanning(true);
            const p = stageRef.current?.getPointerPosition();
            if (p) setLastPointer({ x: p.x, y: p.y });
            return;
        }
        if (activeTool === 'select') {
            if (e.target === stageRef.current) setSelectedIds([]);
            return;
        }
        if (activeTool === 'eraser') {
            const tid = e.target.id();
            if (tid) deleteShape(tid);
            return;
        }
        if (activeTool === 'text') {
            const id = uuidv4();
            const newShape: TextShape = {
                id, type: 'text', x: pos.x, y: pos.y,
                text: 'Click to edit',
                strokeColor, fillColor: strokeColor,
                strokeWidth, roughness, opacity, fontSize, fontFamily: 'Inter',
            };
            addShape(newShape);
            setSelectedIds([id]);
            setTimeout(() => openTextEditor(id, pos.x, pos.y, 'Click to edit'), 50);
            return;
        }
        setIsDrawing(true);
        setStartPos({ x: pos.x, y: pos.y });
        const id = uuidv4();
        setCurrentShapeId(id);
        const base = { id, strokeColor, fillColor, strokeWidth, roughness, opacity };
        if (activeTool === 'pencil') addShape({ ...base, type: 'pencil', x: pos.x, y: pos.y, points: [0, 0] });
        if (activeTool === 'rectangle') addShape({ ...base, type: 'rectangle', x: pos.x, y: pos.y, width: 1, height: 1, cornerRadius: 4 });
        if (activeTool === 'circle') addShape({ ...base, type: 'circle', x: pos.x, y: pos.y, radiusX: 1, radiusY: 1 });
        if (activeTool === 'line') addShape({ ...base, type: 'line', x: pos.x, y: pos.y, x2: pos.x, y2: pos.y });
        if (activeTool === 'arrow') addShape({ ...base, type: 'arrow', x: pos.x, y: pos.y, x2: pos.x, y2: pos.y });
    }, [activeTool, getWorldPos, strokeColor, fillColor, strokeWidth, roughness, opacity, fontSize, addShape, deleteShape, setSelectedIds, openTextEditor]);

    const handleMouseMove = useCallback(() => {
        if (isPanning) {
            const p = stageRef.current?.getPointerPosition();
            if (!p) return;
            setOffset(prev => ({ x: prev.x + p.x - lastPointer.x, y: prev.y + p.y - lastPointer.y }));
            setLastPointer({ x: p.x, y: p.y });
            return;
        }
        if (!isDrawing || !currentShapeId) return;
        const pos = getWorldPos();
        const shape = shapes.find(s => s.id === currentShapeId);
        if (!shape) return;
        if (shape.type === 'pencil') {
            updateShape(currentShapeId, { points: [...(shape as PencilShape).points, pos.x - shape.x, pos.y - shape.y] } as Partial<Shape>);
        } else if (shape.type === 'rectangle') {
            updateShape(currentShapeId, { x: Math.min(pos.x, startPos.x), y: Math.min(pos.y, startPos.y), width: Math.abs(pos.x - startPos.x), height: Math.abs(pos.y - startPos.y) } as Partial<Shape>);
        } else if (shape.type === 'circle') {
            updateShape(currentShapeId, { x: (startPos.x + pos.x) / 2, y: (startPos.y + pos.y) / 2, radiusX: Math.abs(pos.x - startPos.x) / 2, radiusY: Math.abs(pos.y - startPos.y) / 2 } as Partial<Shape>);
        } else if (shape.type === 'line' || shape.type === 'arrow') {
            updateShape(currentShapeId, { x2: pos.x, y2: pos.y } as Partial<Shape>);
        }
    }, [isPanning, isDrawing, currentShapeId, shapes, startPos, getWorldPos, lastPointer, updateShape]);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
        if (isDrawing && currentShapeId) {
            const shape = shapes.find(s => s.id === currentShapeId);
            if (shape) {
                let tooSmall = false;
                if (shape.type === 'rectangle' && (shape.width < 3 || shape.height < 3)) tooSmall = true;
                if (shape.type === 'circle' && shape.radiusX < 2) tooSmall = true;
                if (shape.type === 'pencil' && (shape as PencilShape).points.length < 4) tooSmall = true;
                if (tooSmall) deleteShape(currentShapeId);
            }
        }
        setIsDrawing(false);
        setCurrentShapeId(null);
    }, [isDrawing, currentShapeId, shapes, deleteShape]);

    const handleShapeClick = useCallback((id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
        if (activeTool === 'eraser') { deleteShape(id); return; }
        if (activeTool === 'select') {
            e.cancelBubble = true;
            setSelectedIds(e.evt.shiftKey
                ? (selectedIds.includes(id) ? selectedIds.filter(s => s !== id) : [...selectedIds, id])
                : [id]);
        }
    }, [activeTool, deleteShape, setSelectedIds, selectedIds]);

    const cursor = activeTool === 'hand' ? 'grab' : activeTool === 'eraser' ? 'cell' : activeTool === 'text' ? 'text' : activeTool === 'select' ? 'default' : 'crosshair';
    const sw = strokeWidth / scale;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={gridCanvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }} />
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                style={{ cursor, position: 'absolute', top: 0, left: 0 }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown as any}
                onTouchMove={handleMouseMove as any}
                onTouchEnd={handleMouseUp as any}
                x={offset.x} y={offset.y}
                scaleX={scale} scaleY={scale}
            >
                <Layer>
                    {shapes.map((shape) => {
                        const sel = selectedIds.includes(shape.id);
                        const common = {
                            id: shape.id, key: shape.id,
                            stroke: shape.strokeColor, strokeWidth: sw,
                            opacity: shape.opacity,
                            onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleShapeClick(shape.id, e),
                            onTap: (e: Konva.KonvaEventObject<Event>) => handleShapeClick(shape.id, e as any),
                            shadowBlur: sel ? 12 : 0, shadowColor: '#a78bfa',
                        };

                        switch (shape.type) {
                            case 'rectangle': return (
                                <Rect {...common} x={shape.x} y={shape.y} width={shape.width} height={shape.height}
                                    fill={shape.fillColor === 'transparent' ? undefined : shape.fillColor}
                                    cornerRadius={shape.cornerRadius}
                                    draggable={activeTool === 'select'}
                                    onDragEnd={e => updateShape(shape.id, { x: e.target.x(), y: e.target.y() } as Partial<Shape>)}
                                />
                            );
                            case 'circle': return (
                                <Ellipse {...common} x={shape.x} y={shape.y} radiusX={shape.radiusX} radiusY={shape.radiusY}
                                    fill={shape.fillColor === 'transparent' ? undefined : shape.fillColor}
                                    draggable={activeTool === 'select'}
                                    onDragEnd={e => updateShape(shape.id, { x: e.target.x(), y: e.target.y() } as Partial<Shape>)}
                                />
                            );
                            case 'line': return (
                                <Line {...common} points={[shape.x, shape.y, shape.x2, shape.y2]}
                                    draggable={activeTool === 'select'}
                                    onDragEnd={e => { const dx = e.target.x(), dy = e.target.y(); updateShape(shape.id, { x: shape.x + dx, y: shape.y + dy, x2: shape.x2 + dx, y2: shape.y2 + dy } as Partial<Shape>); e.target.position({ x: 0, y: 0 }); }}
                                />
                            );
                            case 'arrow': return (
                                <Arrow {...common} points={[shape.x, shape.y, shape.x2, shape.y2]}
                                    fill={shape.strokeColor} pointerLength={14 / scale} pointerWidth={10 / scale}
                                    draggable={activeTool === 'select'}
                                    onDragEnd={e => { const dx = e.target.x(), dy = e.target.y(); updateShape(shape.id, { x: shape.x + dx, y: shape.y + dy, x2: shape.x2 + dx, y2: shape.y2 + dy } as Partial<Shape>); e.target.position({ x: 0, y: 0 }); }}
                                />
                            );
                            case 'pencil': return (
                                <Line {...common} x={shape.x} y={shape.y} points={(shape as PencilShape).points}
                                    tension={0.4} lineCap="round" lineJoin="round" fill={undefined}
                                    draggable={activeTool === 'select'}
                                    onDragEnd={e => updateShape(shape.id, { x: shape.x + e.target.x(), y: shape.y + e.target.y() } as Partial<Shape>)}
                                />
                            );
                            case 'text': return (
                                <Text {...common} x={shape.x} y={shape.y} text={(shape as TextShape).text}
                                    fontSize={(shape as TextShape).fontSize} fontFamily={(shape as TextShape).fontFamily}
                                    fill={shape.strokeColor} strokeWidth={0}
                                    draggable={activeTool === 'select'}
                                    onDblClick={() => openTextEditor(shape.id, shape.x, shape.y, (shape as TextShape).text)}
                                    onDragEnd={ev => updateShape(shape.id, { x: ev.target.x(), y: ev.target.y() } as Partial<Shape>)}
                                />
                            );
                            default: return null;
                        }
                    })}
                </Layer>
            </Stage>
        </div>
    );
};

export default CanvasStage;
