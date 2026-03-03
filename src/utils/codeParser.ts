export interface ParsedEntity {
    name: string;
    kind: 'class' | 'interface' | 'struct' | 'enum';
    properties: string[];
    language?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanLine(line: string): string {
    return line
        .replace(/[;,]$/, '')
        .replace(/^\s*(public|private|protected|readonly|static|final|override|abstract|internal|open|lateinit|var|val|let|const|mut)\s/g, '')
        .trim();
}

function isMethodLine(line: string): boolean {
    // Heuristic: contains ( ) and therefore looks like a method signature or call
    return line.includes('(') && line.includes(')');
}

function extractBodyLines(body: string): string[] {
    return body
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .filter(l => !l.startsWith('//') && !l.startsWith('/*') && !l.startsWith('*'))
        .filter(l => !isMethodLine(l))
        .map(cleanLine)
        .filter(l => l.length > 0);
}

// ---------------------------------------------------------------------------
// Language-specific parsers
// ---------------------------------------------------------------------------

/** TypeScript / JavaScript / Java / C# / Swift / Kotlin / PHP / C++ */
function parseBraceLanguage(code: string): ParsedEntity[] {
    const entities: ParsedEntity[] = [];

    // Matches: [optional modifiers] class|interface|struct|enum Name [<generics>] [extends/implements ...] {body}
    const entityRegex =
        /(?:(?:public|private|protected|abstract|final|sealed|data|open|internal|export\s+default|export)\s+)*(?:(class|interface|struct|enum))\s+([a-zA-Z0-9_$<>, ]+?)(?:\s*(?:extends|implements|:)\s*[a-zA-Z0-9_$<>, .]+)?\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;

    let match: RegExpExecArray | null;
    while ((match = entityRegex.exec(code)) !== null) {
        const kind = match[1] as ParsedEntity['kind'];
        const name = match[2].trim().split(/[<\s]/)[0]; // strip generics
        const body = match[3];

        // PHP: properties start with $
        // C++/Java/C#/TS: field declarations
        const properties = extractBodyLines(body);

        if (name) {
            entities.push({ name, kind, properties });
        }
    }

    return entities;
}

/** Python: class Foo(Base): with indented body */
function parsePython(code: string): ParsedEntity[] {
    const entities: ParsedEntity[] = [];
    const lines = code.split('\n');

    let i = 0;
    while (i < lines.length) {
        const classMatch = lines[i].match(/^class\s+([a-zA-Z0-9_]+)\s*(?:\([^)]*\))?\s*:/);
        if (classMatch) {
            const name = classMatch[1];
            const properties: string[] = [];
            i++;

            // Collect indented body
            while (i < lines.length) {
                const line = lines[i];
                const stripped = line.trimStart();

                // End of class block (de-indent or end of file)
                if (line.length > 0 && !line.startsWith(' ') && !line.startsWith('\t')) break;
                if (!stripped || stripped.startsWith('#')) { i++; continue; }
                if (stripped.startsWith('def ')) { i++; continue; } // skip methods

                // Match annotated fields: name: type or name: type = value
                const fieldAnnotated = stripped.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([a-zA-Z_][\w\[\], |]*)/);
                if (fieldAnnotated) {
                    properties.push(`${fieldAnnotated[1]}: ${fieldAnnotated[2]}`);
                } else {
                    // Match self.name = ...
                    const selfField = stripped.match(/^self\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
                    if (selfField) {
                        properties.push(selfField[1]);
                    }
                }
                i++;
            }
            entities.push({ name, kind: 'class', properties, language: 'Python' });
        } else {
            i++;
        }
    }
    return entities;
}

/** Go: type Foo struct { ... } */
function parseGo(code: string): ParsedEntity[] {
    const entities: ParsedEntity[] = [];
    const structRegex = /type\s+([a-zA-Z0-9_]+)\s+(struct|interface)\s*\{([^}]*)\}/g;
    let match: RegExpExecArray | null;
    while ((match = structRegex.exec(code)) !== null) {
        const name = match[1];
        const kind = match[2] as 'struct' | 'interface';
        const body = match[3];
        const properties = body
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0 && !l.startsWith('//'))
            .map(l => l.split(/\s+/).slice(0, 2).join(' ')) // "FieldName Type"
            .filter(l => l.length > 0);
        entities.push({ name, kind, properties, language: 'Go' });
    }
    return entities;
}

/** Rust: struct Foo { ... } or enum Foo { ... } */
function parseRust(code: string): ParsedEntity[] {
    const entities: ParsedEntity[] = [];
    const rustRegex = /(?:pub\s+)?(?:(struct|enum))\s+([a-zA-Z0-9_]+)(?:<[^>]*>)?\s*\{([^{}]*)\}/g;
    let match: RegExpExecArray | null;
    while ((match = rustRegex.exec(code)) !== null) {
        const kind = match[1] as 'struct' | 'enum';
        const name = match[2];
        const body = match[3];
        const properties = body
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0 && !l.startsWith('//'))
            .map(l => l.replace(/,\s*$/, '').replace(/^pub\s+/, ''))
            .filter(l => l.length > 0);
        entities.push({ name, kind, properties, language: 'Rust' });
    }
    return entities;
}

/** Ruby: class Foo ... attr_accessor / attr_reader / attr_writer */
function parseRuby(code: string): ParsedEntity[] {
    const entities: ParsedEntity[] = [];
    const lines = code.split('\n');
    let i = 0;
    while (i < lines.length) {
        const classMatch = lines[i].trim().match(/^class\s+([a-zA-Z0-9_:]+)/);
        if (classMatch) {
            const name = classMatch[1].split('::').pop()!;
            const properties: string[] = [];
            i++;
            while (i < lines.length) {
                const line = lines[i].trim();
                if (line === 'end') break;
                const attrMatch = line.match(/^attr(?:_accessor|_reader|_writer)\s+(.+)/);
                if (attrMatch) {
                    const attrs = attrMatch[1].split(',').map(a => a.trim().replace(/^:/, ''));
                    properties.push(...attrs);
                }
                i++;
            }
            entities.push({ name, kind: 'class', properties, language: 'Ruby' });
        }
        i++;
    }
    return entities;
}

// ---------------------------------------------------------------------------
// Auto-detect language and dispatch
// ---------------------------------------------------------------------------

function detectLanguage(code: string): string {
    const trimmed = code.trim();
    if (/^class\s+\w+.*:$/m.test(trimmed) || /self\.\w+\s*=/.test(trimmed) || /\bdef\s+\w+\(/.test(trimmed)) return 'python';
    if (/\btype\s+\w+\s+struct\b/.test(trimmed) || /\btype\s+\w+\s+interface\b/.test(trimmed)) return 'go';
    if (/\bpub\s+struct\b/.test(trimmed) || /\bimpl\b/.test(trimmed) || /\bfn\s+\w+/.test(trimmed)) return 'rust';
    if (/^class\s+\w+/.test(trimmed) && /\battr_accessor\b/.test(trimmed)) return 'ruby';
    if (/\b(class|interface|struct|enum)\b/.test(trimmed)) return 'brace';
    return 'brace';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function parseCodeToEntities(code: string): ParsedEntity[] {
    const lang = detectLanguage(code);

    switch (lang) {
        case 'python': return parsePython(code);
        case 'go': return parseGo(code);
        case 'rust': return parseRust(code);
        case 'ruby': return parseRuby(code);
        default: return parseBraceLanguage(code);
    }
}
