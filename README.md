# CounselAI: AI Admission Counsellor for Coaching Institutes

**Live demo:** https://dcc-ai-admission-counsellor.vercel.app

A website chatbot that answers course, fee, scholarship, batch and admission questions 24/7, from your institute's own content, in English, Hindi or Hinglish. Embed it on any website with one line. Built by [DeCODE Crafters](https://decodecrafters.in).

## Features

- **Answers from your content only:** courses, fees, scholarships, timings, refund policy and FAQs live in plain Markdown files in `content/`.
- **Free by default:** built-in keyword search (BM25, with Hindi/Hinglish word matching) answers with the right sections. No API key needed.
- **Natural answers with AI (optional):** set `GEMINI_API_KEY` and Gemini writes short, friendly replies using only the matching sections. If Gemini fails, it falls back to search automatically.
- **One-line embed:** a floating chat bubble for WordPress, Wix or any site.
- **Follow-up questions** keep context ("how much is it?" after asking about a course).
- Rate-limited API (20 questions per visitor per 10 minutes).

Tech: Next.js 15 (App Router), React 19, Tailwind CSS 4, Google Gen AI SDK.

## Use it for your institute

1. **Edit `content/*.md`.** Each `## Heading` becomes one answer the bot can use. Write facts plainly, with exact fees and dates. The included "Starlight Coaching Centre" is sample data.
2. **Run locally:**

   ```bash
   npm install
   npm run dev      # http://localhost:3000
   npm test         # checks the sample questions find the right answers
   ```

3. **Deploy:** push to GitHub, then import the repo on [Vercel](https://vercel.com).
4. **Optional AI:** in Vercel → Settings → Environment Variables, add `GEMINI_API_KEY` (free key from [Google AI Studio](https://aistudio.google.com/apikey)). `GEMINI_MODEL` defaults to `gemini-flash-latest`.
5. **Embed:** add this before `</body>` on your website:

   ```html
   <script src="https://YOUR-DEPLOYMENT.vercel.app/widget.js" defer></script>
   ```

## API

`POST /api/chat` with `{ "message": "NEET ki fees kitni hai?", "history": [] }` returns `{ "answer", "sources", "mode": "ai" | "search" }`.

## Licence

MIT © 2026 DeCODE Crafters. The search engine is adapted from Phoenix, the assistant on decodecrafters.in.
