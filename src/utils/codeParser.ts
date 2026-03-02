export interface ParsedEntity {
    name: string;
    properties: string[];
}

export function parseCodeToEntities(code: string): ParsedEntity[] {
    const entities: ParsedEntity[] = [];

    // Match 'class Name {' or 'interface Name {'
    const entityRegex = /(?:class|interface)\s+([a-zA-Z0-9_]+)\s*(?:extends\s+[a-zA-Z0-9_]+)?\s*\{([^}]*)\}/g;

    let match;
    while ((match = entityRegex.exec(code)) !== null) {
        const name = match[1];
        const body = match[2];

        // Match properties like 'id: number;', 'name: string', 'public foo: boolean'
        // This splits by lines and filters out empty spaces, comments, and methods (roughly)
        const lines = body.split('\n');
        const properties: string[] = [];

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            if (line.startsWith('//') || line.startsWith('/*')) continue;

            // Skip method signatures roughly like 'foo() {' or 'constructor()'
            if (line.includes('(') && line.includes(')')) continue;

            // Clean up trailing semicolons or commas
            line = line.replace(/[,;]$/, '').trim();
            if (line) {
                properties.push(line);
            }
        }

        entities.push({ name, properties });
    }

    return entities;
}
