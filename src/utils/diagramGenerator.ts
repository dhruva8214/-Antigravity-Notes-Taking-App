import { v4 as uuidv4 } from 'uuid';
import type { ParsedEntity } from './codeParser';
import type { Shape, RectangleShape, TextShape, LineShape } from '../types';

export function generateDiagramShapes(
    entities: ParsedEntity[],
    startX: number = 100,
    startY: number = 100,
    theme: 'light' | 'dark' = 'dark'
): Shape[] {
    const shapes: Shape[] = [];
    let currentX = startX;

    const strokeColor = theme === 'dark' ? '#a78bfa' : '#6d28d9';
    const textColor = theme === 'dark' ? '#e2e8f0' : '#1e293b';
    const fillColor = theme === 'dark' ? '#1e1b4b' : '#f8fafc';

    entities.forEach((entity) => {
        // Calculate rough dimensions based on text length
        const maxTextLength = Math.max(
            entity.name.length * 12, // Name is bold/larger
            ...entity.properties.map(p => p.length * 8)
        );
        const width = Math.max(150, maxTextLength + 40); // Base minimum width
        const headerHeight = 40;
        const rowHeight = 24;
        const height = headerHeight + (entity.properties.length * rowHeight) + 20;

        const baseId = uuidv4();

        // 1. Background Rectangle
        const rect: RectangleShape = {
            id: `rect-${baseId}`,
            type: 'rectangle',
            x: currentX,
            y: startY,
            width,
            height,
            cornerRadius: 8,
            strokeColor,
            fillColor,
            strokeWidth: 2,
            roughness: 0,
            opacity: 1,
        };
        shapes.push(rect);

        // 2. Class/Interface Name (Header)
        const nameText: TextShape = {
            id: `title-${baseId}`,
            type: 'text',
            x: currentX + 16,
            y: startY + 12,
            text: `<<${entity.name}>>`,
            fontSize: 16,
            fontFamily: 'Space Grotesk, sans-serif',
            strokeColor: textColor,
            fillColor: textColor,
            strokeWidth: 0,
            roughness: 0,
            opacity: 1,
        };
        shapes.push(nameText);

        // 3. Divider Line
        const divider: LineShape = {
            id: `div-${baseId}`,
            type: 'line',
            x: currentX,
            y: startY + headerHeight,
            x2: currentX + width,
            y2: startY + headerHeight,
            strokeColor,
            fillColor: strokeColor,
            strokeWidth: 1,
            roughness: 0,
            opacity: 0.5,
        };
        shapes.push(divider);

        // 4. Properties Text (Multiline)
        const propertiesText = entity.properties.join('\n');
        const propsText: TextShape = {
            id: `props-${baseId}`,
            type: 'text',
            x: currentX + 16,
            y: startY + headerHeight + 12,
            text: propertiesText || '(No properties)',
            fontSize: 14,
            fontFamily: 'Inter, monospace',
            strokeColor: textColor,
            fillColor: textColor,
            strokeWidth: 0,
            roughness: 0,
            opacity: 0.9,
        };
        shapes.push(propsText);

        // Advance X position for the next box
        currentX += width + 50;
    });

    return shapes;
}
