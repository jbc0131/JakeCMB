import { logger } from './logger'

export async function generateStudySet({ notes, numCards, numQuestions }) {
  logger.log('API', `Sending request: ${numCards} cards, ${numQuestions} questions, ${notes.length} chars of notes`)

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

  let response
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    logger.log('API', `Response received: HTTP ${response.status}`)
  } catch (err) {
    logger.error('API', 'fetch() failed — network error or /api/generate not reachable', err)
    throw new Error('Network error: ' + err.message)
  }

  if (!response.ok) {
    let errText = ''
    try { errText = await response.text() } catch (_) {}
    logger.error('API', `HTTP ${response.status} from /api/generate`, errText)
    throw new Error(`API error ${response.status}: ${errText}`)
  }

  let data
  try {
    data = await response.json()
    logger.log('API', 'Response JSON parsed', { stop_reason: data.stop_reason, content_blocks: data.content?.length })
  } catch (err) {
    logger.error('API', 'Failed to parse response as JSON', err)
    throw new Error('Invalid JSON response from API')
  }

  if (data.error) {
    logger.error('API', 'Anthropic API error in response body', data.error)
    throw new Error(data.error.message)
  }

  const rawText = (data.content || []).map(b => b.text || '').join('').trim()
  logger.log('API', `Raw model output (first 200 chars): ${rawText.slice(0, 200)}`)

  const clean = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()

  let parsed
  try {
    parsed = JSON.parse(clean)
    logger.ok('API', `JSON parsed: ${parsed.flashcards?.length ?? 0} flashcards, ${parsed.questions?.length ?? 0} questions`)
  } catch (err) {
    logger.error('API', 'JSON.parse failed on model output', { error: err.message, raw: clean.slice(0, 400) })
    throw new Error('Model returned invalid JSON: ' + err.message)
  }

  return {
    flashcards: parsed.flashcards || [],
    questions: parsed.questions || [],
  }
}

