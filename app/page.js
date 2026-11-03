import Chat from '@/components/Chat'

const FEATURES = [
  ['Answers from your content', 'Add courses, fees, batches and FAQs as simple text files. It answers only from that information, quoting your exact figures.'],
  ['English, Hindi & Hinglish', 'Students and parents ask in their own words: "NEET ki fees kitni hai?" works.'],
  ['Free to run', 'Works out of the box with built-in search. Add a free Gemini key for natural, conversational answers.'],
  ['One line to embed', 'Add a single script tag to any website (WordPress, Wix or custom) and a chat bubble appears.']
]

const STEPS = [
  ['Write your content', 'Edit the Markdown files in content/: courses, fees, scholarships, timings, FAQs.'],
  ['Deploy', 'Push to GitHub and import on Vercel. Optionally add GEMINI_API_KEY.'],
  ['Embed', 'Paste the script tag on your website. Done.']
]

export default function Home() {
  return (
    <main>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="text-lg font-bold">
          Counsel<span className="text-gold">AI</span>
        </span>
        <a href="https://github.com/Deepak2698/dcc-ai-admission-counsellor" className="text-sm text-slate-300 hover:text-gold">
          GitHub →
        </a>
      </nav>

      <section className="mx-auto grid max-w-6xl items-start gap-10 px-5 pt-8 pb-16 lg:grid-cols-2">
        <div className="lg:pt-10">
          <p className="text-sm font-semibold tracking-widest text-gold uppercase">For coaching institutes & schools</p>
          <h1 className="mt-3 text-4xl leading-tight font-extrabold sm:text-5xl">Your admissions desk, open 24/7.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            An AI counsellor on your website that answers course, fee, scholarship and batch questions instantly, from your own
            information, in English, Hindi or Hinglish.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#embed" className="rounded-xl bg-gold px-5 py-3 font-bold text-navy-950">
              Add it to your website
            </a>
            <a href="https://decodecrafters.in/contact" className="rounded-xl border border-white/20 px-5 py-3 font-semibold hover:border-gold">
              Get it set up for you
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-400">Try the live demo → ask it anything about our sample institute.</p>
        </div>
        <div>
          <Chat />
          <p className="mt-2 text-center text-xs text-slate-500">Demo data: Starlight Coaching Centre is a sample institute.</p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-navy-900">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-navy-950/60 p-5">
              <h2 className="font-semibold text-gold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-2xl font-bold">How it works</h2>
        <ol className="mt-6 grid gap-5 sm:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="rounded-2xl border border-white/10 p-5">
              <span className="grid size-8 place-items-center rounded-full bg-gold font-bold text-navy-950">{i + 1}</span>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-300">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="embed" className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="text-2xl font-bold">Add it to any website</h2>
        <p className="mt-2 text-slate-300">Paste this just before the closing &lt;/body&gt; tag:</p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-navy-900 p-4 text-sm text-gold">
          {'<script src="https://dcc-ai-admission-counsellor.vercel.app/widget.js" defer></script>'}
        </pre>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-400">
        Built by <a href="https://decodecrafters.in" className="text-gold">DeCODE Crafters</a> · Open source (MIT) on{' '}
        <a href="https://github.com/Deepak2698/dcc-ai-admission-counsellor" className="text-gold">GitHub</a>
      </footer>
    </main>
  )
}
