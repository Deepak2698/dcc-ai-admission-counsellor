// The knowledge base: every Markdown file in content/, split into one
// searchable section per "## Heading". Loaded once per server instance.
import fs from 'node:fs'
import path from 'node:path'
import { SearchIndex } from './search.js'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export const parseMarkdown = (file, markdown) => {
  const lines = markdown.split(/\r?\n/)
  const doc = (lines.find((l) => l.startsWith('# ')) || `# ${file}`).slice(2).trim()
  const sections = []
  let current = null
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current)
      current = { title: line.slice(3).trim(), lines: [] }
    } else if (current && !line.startsWith('# ') && !line.startsWith('>')) {
      current.lines.push(line)
    }
  }
  if (current) sections.push(current)
  return sections
    .map((s, i) => ({ id: `${file}#${i}`, doc, title: s.title, text: s.lines.join('\n').trim() }))
    .filter((s) => s.text)
}

let cached = null

export const loadKnowledge = (dir = CONTENT_DIR) => {
  if (cached && dir === CONTENT_DIR) return cached
  const sections = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .flatMap((f) => parseMarkdown(f.replace(/\.md$/, ''), fs.readFileSync(path.join(dir, f), 'utf8')))
  const kb = { sections, index: new SearchIndex(sections), institute: sections[0]?.doc || 'our institute' }
  if (dir === CONTENT_DIR) cached = kb
  return kb
}
