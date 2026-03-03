import { v4 as uuidv4 } from 'uuid';
import type { ParsedEntity } from './codeParser';
import type { Shape, RectangleShape, TextShape, LineShape } from '../types';

// ─── Layout constants ───────────────────────────────────────────────────────
const CHAR_WIDTH = 7.5;   // approx px per character at fontSize 13
const HEADER_H = 52;    // height of the header band (stereotype + name)
const ROW_H = 22;    // height per property row
const PADDING_X = 20;    // left/right padding inside box
const PADDING_BOT = 14;    // bottom padding inside box
const GAP_X = 60;    // horizontal gap between boxes
const GAP_Y = 70;    // vertical gap between rows of boxes
const COLS = 4;     // max boxes per row before wrapping
const MIN_WIDTH = 160;   // minimum box width

// ─── Colour helpers ──────────────────────────────────────────────────────────
function palette(theme: 'light' | 'dark', kind: ParsedEntity['kind']) {
    const isDark = theme === 'dark';
    const strokeMap: Record<ParsedEntity['kind'], string> = {
        class: isDark ? '#a78bfa' : '#7c3aed',
        interface: isDark ? '#67e8f9' : '#0e7490',
        struct: isDark ? '#86efac' : '#166534',
        enum: isDark ? '#fda4af' : '#be123c',
    };
    return {
        stroke: strokeMap[kind],
        fill: isDark ? '#1a1535' : '#f8fafc',
        headerFill: isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.06)',
        text: isDark ? '#e2e8f0' : '#1e293b',
        muted: isDark ? '#94a3b8' : '#64748b',
    };
}

// ─── Public entry point ──────────────────────────────────────────────────────
export function generateDiagramShapes(
    entities: ParsedEntity[],
    startX = 100,
    startY = 100,
    theme: 'light' | 'dark' = 'dark'
): Shape[] {
    const shapes: Shape[] = [];

    entities.forEach((entity, idx) => {
        const col = idx % COLS;
        const row = Math.floor(idx / COLS);

        // ── Dimensions ─────────────────────────────────────────────────────
        const longestLine = Math.max(
            entity.name.length * (CHAR_WIDTH + 0.5),
            ...entity.properties.map(p => p.length * CHAR_WIDTH)
        );
        const width = Math.max(MIN_WIDTH, longestLine + PADDING_X * 2);

        // Calculate total height of all boxes in previous rows to determine row offset
        // For simplicity we use max possible height per row (could be refined)
        const height = HEADER_H + entity.properties.length * ROW_H + PADDING_BOT;

        // We need to calculate x/y positions accounting for all previous boxes
        // For grid layout, calculate the x positions per column
        const boxX = startX + col * (MIN_WIDTH + GAP_X);
        const boxY = startY + row * (HEADER_H + 10 * ROW_H + GAP_Y); // assume max 10 props per row height estimate

        const c = palette(theme, entity.kind);
        const base = uuidv4();

        // 1. Outer rectangle
        const rect: RectangleShape = {
            id: `rect-${base}`,
            type: 'rectangle',
            x: boxX, y: boxY,
            width, height,
            cornerRadius: 10,
            strokeColor: c.stroke,
            fillColor: c.fill,
            strokeWidth: 2,
            roughness: 0,
            opacity: 1,
        };
        shapes.push(rect);

        // 2. Header fill band
        const headerBand: RectangleShape = {
            id: `hband-${base}`,
            type: 'rectangle',
            x: boxX + 1, y: boxY + 1,
            width: width - 2, height: HEADER_H - 1,
            cornerRadius: 9,
            strokeColor: 'transparent',
            fillColor: c.headerFill,
            strokeWidth: 0,
            roughness: 0,
            opacity: 1,
        };
        shapes.push(headerBand);

        // 3. Stereotype label (««class»», «interface», etc.)
        const stereotype = `«${entity.kind}»`;
        const stereoText: TextShape = {
            id: `stereo-${base}`,
            type: 'text',
            x: boxX + PADDING_X,
            y: boxY + 10,
            text: stereotype,
            fontSize: 11,
            fontFamily: 'Inter, sans-serif',
            strokeColor: c.muted,
            fillColor: c.muted,
            strokeWidth: 0,
            roughness: 0,
            opacity: 1,
        };
        shapes.push(stereoText);

        // 4. Entity name
        const nameText: TextShape = {
            id: `name-${base}`,
            type: 'text',
            x: boxX + PADDING_X,
            y: boxY + 26,
            text: entity.name,
            fontSize: 15,
            fontFamily: 'Space Grotesk, sans-serif',
            strokeColor: c.stroke,
            fillColor: c.stroke,
            strokeWidth: 0,
            roughness: 0,
            opacity: 1,
        };
        shapes.push(nameText);

        // 5. Divider line
        const divider: LineShape = {
            id: `div-${base}`,
            type: 'line',
            x: boxX,
            y: boxY + HEADER_H,
            x2: boxX + width,
            y2: boxY + HEADER_H,
            strokeColor: c.stroke,
            fillColor: c.stroke,
            strokeWidth: 1,
            roughness: 0,
            opacity: 0.35,
        };
        shapes.push(divider);

        // 6. One TextShape per property (ensures correct vertical alignment)
        if (entity.properties.length === 0) {
            const emptyText: TextShape = {
                id: `prop-empty-${base}`,
                type: 'text',
                x: boxX + PADDING_X,
                y: boxY + HEADER_H + 10,
                text: '(no fields)',
                fontSize: 12,
                fontFamily: 'monospace',
                strokeColor: c.muted,
                fillColor: c.muted,
                strokeWidth: 0,
                roughness: 0,
                opacity: 0.7,
            };
            shapes.push(emptyText);
        } else {
            entity.properties.forEach((prop, propIdx) => {
                const propText: TextShape = {
                    id: `prop-${base}-${propIdx}`,
                    type: 'text',
                    x: boxX + PADDING_X,
                    y: boxY + HEADER_H + 8 + propIdx * ROW_H,
                    text: prop,
                    fontSize: 13,
                    fontFamily: 'monospace',
                    strokeColor: c.text,
                    fillColor: c.text,
                    strokeWidth: 0,
                    roughness: 0,
                    opacity: 0.9,
                };
                shapes.push(propText);
            });
        }
    });

    return shapes;
}
