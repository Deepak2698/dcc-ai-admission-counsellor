import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadKnowledge, parseMarkdown } from '../lib/knowledge.js'
import { retrieve, fallbackAnswer } from '../lib/answer.js'

const kb = loadKnowledge()
const top = (q) => retrieve(kb, q)[0]?.title

test('content is split into one section per ## heading', () => {
  const s = parseMarkdown('x', '# Doc\n\n> note\n\n## One\nfirst\n\n## Two\nsecond\n')
  assert.deepEqual(s.map((x) => [x.doc, x.title, x.text]), [['Doc', 'One', 'first'], ['Doc', 'Two', 'second']])
  assert.ok(kb.sections.length >= 15)
  assert.equal(kb.institute, 'Starlight Coaching Centre')
})

test('finds the right section for common questions, including Hinglish', () => {
  // Both NEET options are relevant; the answer shows the top two sections.
  for (const q of ['What is the fee for the NEET course?', 'NEET ki fees kitni hai?']) {
    const answer = fallbackAnswer(kb, retrieve(kb, q))
    assert.match(answer, /₹1,30,000/, q)
    assert.match(answer, /₹1,10,000/, q)
  }
  assert.equal(top('Do you give any discount or concession?'), 'Scholarships')
  assert.equal(top('Can I pay in EMI?'), 'Instalments')
  assert.equal(top('What are the batch timings?'), 'Batch timings')
  assert.equal(top('What is your phone number?'), 'Contact and timings')
  assert.equal(top('Will I get my money back if I leave?'), 'Refund policy')
})

test('follow-up questions use the previous question', () => {
  const history = [{ role: 'user', content: 'Tell me about the JEE crash course' }]
  assert.equal(retrieve(kb, 'how much is it?', history)[0].title, 'JEE Main crash course')
})

test('free answers quote the matching sections; unknown questions point to the office', () => {
  const answer = fallbackAnswer(kb, retrieve(kb, 'NEET fees'))
  assert.match(answer, /₹1,30,000/)
  assert.match(answer, /^Here's what I found/)
  assert.match(answer, /Call or WhatsApp \+91 90000 00000\.$/)
  assert.doesNotMatch(answer, /Page:/)
  const none = fallbackAnswer(kb, [])
  assert.match(none, /couldn't find/)
  assert.match(none, /\+91 90000 00000/)
})
