// Writes the counsellor's answer from the knowledge base. With a Gemini API
// key it asks Gemini to answer using only the retrieved sections; without a
// key (or if Gemini fails) it answers with the best-matching sections
// directly, so the demo works for free.
import { GoogleGenAI } from '@google/genai'

const MAX_OUTPUT_TOKENS = 600

export const systemPrompt = (institute) => `You are the admission counsellor chatbot for ${institute}.
Answer questions from students and parents about courses, fees, scholarships, batches, admissions and contact details.
- Use ONLY the INSTITUTE INFORMATION given with each question. If the answer is not there, say you don't know and suggest calling or WhatsApp-ing the office. Never invent fees, dates, discounts or results.
- Reply in the visitor's language (English, Hindi or Hinglish), warmly and briefly: 2 to 5 sentences, or a short list.
- For fees and offers, quote the exact figures given.
- End with one helpful next step (book a free counselling session, take the scholarship test, or contact the office).`

export const retrieve = (kb, question, history = []) => {
  const lastUser = [...history].reverse().find((m) => m.role === 'user')?.content || ''
  let results = kb.index.search(`${question} ${question} ${lastUser}`, { limit: 4, maxPerDoc: 4 })
  if (!results.length && lastUser) results = kb.index.search(lastUser, { limit: 4, maxPerDoc: 4 })
  return results
}

const contactSection = (kb) => kb.sections.find((s) => /contact/i.test(s.title))

const phoneOf = (kb) => contactSection(kb)?.text.match(/\+?\d[\d\s-]{8,}\d/)?.[0]

// Search can't tell whether a question is in scope (that's what the optional
// AI is for), so free answers say what they matched and how to reach a person.
export const fallbackAnswer = (kb, results) => {
  if (!results.length) {
    const contact = contactSection(kb)
    return `I couldn't find that in our information. ${contact ? `Please contact the office: ${contact.text}` : 'Please contact the office.'}`
  }
  const top = results.slice(0, 2)
  const phone = phoneOf(kb)
  return [
    "Here's what I found:",
    ...top.map((r) => `**${r.title}**\n${r.text}`),
    phone ? `Not quite what you asked? Call or WhatsApp ${phone}.` : 'Not quite what you asked? Please contact the office.'
  ].join('\n\n')
}

export const aiAnswer = async ({ apiKey, model, kb, question, history, results }) => {
  const ai = new GoogleGenAI({ apiKey })
  const context = results.map((r, i) => `[${i + 1}] ${r.title}\n${r.text}`).join('\n\n') || '(nothing matched)'
  const contents = history.slice(-6).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content).slice(0, 1500) }]
  }))
  contents.push({ role: 'user', parts: [{ text: `INSTITUTE INFORMATION\n${context}\n\nQUESTION\n${question}` }] })
  while (contents.length && contents[0].role !== 'user') contents.shift()
  const res = await ai.models.generateContent({
    model,
    contents,
    config: { systemInstruction: systemPrompt(kb.institute), maxOutputTokens: MAX_OUTPUT_TOKENS }
  })
  return (res.text || '').trim()
}
