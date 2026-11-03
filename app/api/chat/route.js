// POST /api/chat  { message, history: [{ role: 'user'|'assistant', content }] }
//   -> { answer, sources: [titles], mode: 'ai' | 'search' }
import { loadKnowledge } from '@/lib/knowledge'
import { retrieve, fallbackAnswer, aiAnswer } from '@/lib/answer'

export const runtime = 'nodejs'

const MAX_QUESTION = 600
const LIMIT = 20 // questions per visitor per 10 minutes
const WINDOW_MS = 10 * 60 * 1000
const hits = new Map()

const rateLimited = (ip) => {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > LIMIT
}

const cleanHistory = (history) =>
  (Array.isArray(history) ? history : [])
    .filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-8)

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (rateLimited(ip)) {
    return Response.json({ error: 'Too many questions. Please wait a few minutes.' }, { status: 429 })
  }
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Send JSON: { "message": "..." }' }, { status: 400 })
  }
  const question = String(body?.message || '').trim()
  if (!question) return Response.json({ error: 'Please type a question.' }, { status: 400 })
  if (question.length > MAX_QUESTION) {
    return Response.json({ error: `Please keep questions under ${MAX_QUESTION} characters.` }, { status: 400 })
  }

  const kb = loadKnowledge()
  const history = cleanHistory(body.history)
  const results = retrieve(kb, question, history)
  const sources = [...new Set(results.map((r) => r.title))].slice(0, 3)

  const apiKey = process.env.GEMINI_API_KEY
  if (apiKey) {
    try {
      const answer = await aiAnswer({
        apiKey,
        model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
        kb, question, history, results
      })
      if (answer) return Response.json({ answer, sources, mode: 'ai' })
    } catch (err) {
      console.warn('[chat] Gemini failed, answering from search:', err?.message)
    }
  }
  return Response.json({ answer: fallbackAnswer(kb, results), sources, mode: 'search' })
}
