export async function generateStudySet({ notes, numCards, numQuestions }) {
  const prompt = `You are a Cellular and Molecular Biology study assistant. Generate a study set from the student notes below.

IMPORTANT: Respond with ONLY a raw JSON object. No markdown, no code fences, no explanation before or after. Start your response with { and end with }.

The JSON must follow this exact structure:
{
  "flashcards": [
    {"term": "term name", "definition": "clear definition"}
  ],
  "questions": [
    {"type": "mc", "question": "question text", "options": ["A. option", "B. option", "C. option", "D. option"], "answer": "A"},
    {"type": "fb", "question": "The ___ is the structure that ___.", "answer": "answer1; answer2"},
    {"type": "sa", "question": "Explain why...", "answer": "sample answer text"}
  ]
}

Rules:
- Generate exactly ${numCards} flashcards
- Generate exactly ${numQuestions} questions, mixing mc / fb / sa types evenly
- For mc: answer must be exactly one of: A, B, C, D
- Keep all content accurate to the notes
- No trailing commas, valid JSON only

STUDENT NOTES:
${notes.slice(0, 8000)}`

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`API error ${response.status}: ${err}`)
  }

  const data = await response.json()

  if (data.error) throw new Error(data.error.message)

  const rawText = (data.content || []).map(b => b.text || '').join('').trim()
  const clean = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim()

  const parsed = JSON.parse(clean)
  return {
    flashcards: parsed.flashcards || [],
    questions: parsed.questions || [],
  }
}
