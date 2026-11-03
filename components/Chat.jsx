'use client'
// The counsellor chat. Used on the demo page and inside the embeddable
// widget (/embed, loaded by public/widget.js).
import { useEffect, useRef, useState } from 'react'

const SUGGESTIONS = [
  'What is the fee for the NEET course?',
  'Do you give scholarships?',
  'What are the batch timings?',
  'Can I pay in instalments?',
  'JEE crash course kab start hota hai?'
]

// Minimal, safe formatting for answers: escape HTML first, then **bold**,
// "1." / "-" list lines and line breaks.
const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const formatAnswer = (text) =>
  escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .split('\n')
    .map((line) => (/^\s*([-•]|\d+\.)\s+/.test(line) ? `<span class="block pl-3">${line.trim()}</span>` : line))
    .join('<br/>')

export default function Chat({ institute = 'Starlight Coaching Centre', compact = false }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const ask = async (text) => {
    const question = text.trim()
    if (!question || busy) return
    const history = messages.map(({ role, content }) => ({ role, content }))
    setMessages((m) => [...m, { role: 'user', content: question }])
    setInput('')
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history })
      })
      const data = await res.json()
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: data.answer || data.error || 'Sorry, something went wrong.', sources: data.sources || [] }
      ])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Network problem. Please try again.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900 shadow-2xl ${compact ? 'h-full' : 'h-[560px]'}`}>
      <header className="flex items-center gap-3 border-b-2 border-gold bg-navy-950 px-4 py-3">
        <span className="grid size-9 place-items-center rounded-full bg-gold font-bold text-navy-950" aria-hidden="true">
          AI
        </span>
        <div className="leading-tight">
          <p className="font-semibold text-gold">{institute}</p>
          <p className="text-xs text-slate-300">Admission counsellor · replies instantly</p>
        </div>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-navy-800 px-4 py-3 text-sm text-slate-100">
          Hi! 👋 Ask me about courses, fees, scholarships, batch timings or admissions.
        </div>
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="rounded-full border border-gold/50 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-gold/15"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-gold px-4 py-3 text-sm font-medium text-navy-950">
              {m.content}
            </div>
          ) : (
            <div key={i} className="max-w-[85%] rounded-2xl rounded-bl-sm bg-navy-800 px-4 py-3 text-sm leading-relaxed text-slate-100">
              <div dangerouslySetInnerHTML={{ __html: formatAnswer(m.content) }} />
              {m.sources?.length > 0 && (
                <p className="mt-2 border-t border-white/10 pt-2 text-xs text-slate-400">From: {m.sources.join(' · ')}</p>
              )}
            </div>
          )
        )}
        {busy && (
          <div className="w-16 rounded-2xl bg-navy-800 px-4 py-3 text-center text-slate-300" aria-label="Typing">
            •••
          </div>
        )}
      </div>

      <form
        className="flex gap-2 border-t border-white/10 bg-navy-950 p-3"
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 600))}
          placeholder="Ask about fees, batches, scholarships…"
          aria-label="Your question"
          className="flex-1 rounded-xl border border-white/15 bg-navy-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-gold px-4 text-sm font-bold text-navy-950 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}
