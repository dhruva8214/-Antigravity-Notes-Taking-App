export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    tag: string;
}

function generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function parseFlashcardsFromText(raw: string): Flashcard[] {
    const cards: Flashcard[] = [];

    // Try JSON first (if model outputs JSON)
    try {
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed)) {
                return parsed.map((item: { question?: string; answer?: string; tag?: string }) => ({
                    id: generateId(),
                    question: item.question?.trim() || '',
                    answer: item.answer?.trim() || '',
                    tag: item.tag?.trim() || 'General',
                })).filter(c => c.question && c.answer);
            }
        }
    } catch {
        // fallback to text parsing
    }

    // Parse "Q: ... A: ..." or "Question: ... Answer: ..." format
    const blocks = raw.split(/\n(?=(?:Q:|Question:|Flashcard\s*\d+))/i).filter(Boolean);

    for (const block of blocks) {
        const questionMatch = block.match(/(?:Q(?:uestion)?)\s*[:\-]?\s*(.+?)(?=\n|$)/i);
        const answerMatch = block.match(/(?:A(?:nswer)?)\s*[:\-]?\s*([\s\S]+?)(?=(?:\n(?:Q(?:uestion)?|Flashcard)\s*[:\-])|$)/i);
        const tagMatch = block.match(/(?:Tag|Topic)\s*[:\-]?\s*(.+?)(?=\n|$)/i);

        if (questionMatch && answerMatch) {
            cards.push({
                id: generateId(),
                question: questionMatch[1].trim(),
                answer: answerMatch[1].trim(),
                tag: tagMatch ? tagMatch[1].trim() : 'General',
            });
        }
    }

    return cards;
}

export async function generateFlashcards(
    notesText: string,
    apiKey: string = import.meta.env.VITE_GROQ_API_KEY ?? '',
    cardCount: number = 12
): Promise<Flashcard[]> {
    if (!apiKey.trim()) throw new Error('Please enter your Groq API key.');
    if (!notesText.trim()) throw new Error('Please enter some notes text.');

    const prompt = `Convert the following student notes into ${cardCount} study flashcards in question and answer format. Keep questions simple and useful for exam revision. Also assign a short topic tag to each card.

Return ONLY a JSON array in this exact format (no markdown, no extra text):
[
  {"question": "...", "answer": "...", "tag": "..."},
  ...
]

Student Notes:
${notesText}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
            max_tokens: 3000,
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const msg = (err as { error?: { message?: string } }).error?.message || response.statusText;
        throw new Error(`Groq API error: ${msg}`);
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? '';

    const cards = parseFlashcardsFromText(content);
    if (cards.length === 0) {
        throw new Error('Could not parse flashcards from AI response. Try again.');
    }

    return cards;
}
