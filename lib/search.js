// In-memory BM25 keyword search over the knowledge base (content/*.md).
// An institute's content is small (a few hundred sections), so this runs
// entirely on the server with no search or embedding service, and costs
// nothing. Adapted from Phoenix, the assistant on decodecrafters.in.

const STOPWORDS = new Set((
  'a an and are as at be but by can do does for from has have how i if in into is it its me my of on or our ' +
  'so than that the their them then there these they this to us was we what when where which who why will ' +
  'with you your about also any all just more most not only other some such very would should could may ' +
  'kya hai hain ka ki ke ko se me mein aur bhi ye yeh woh kaise kab kahan'
).split(' '));

// Words visitors use that mean the same as the words on the site (including
// common Hinglish), mapped to one form so they match.
const SYNONYMS = {
  fee: 'price', fees: 'price', cost: 'price', costs: 'price', charge: 'price', charges: 'price',
  pricing: 'price', amount: 'price', kitne: 'price', kitna: 'price', kitni: 'price', paisa: 'price', paise: 'price', rupees: 'price',
  timing: 'schedule', timings: 'schedule', batch: 'schedule', batches: 'schedule',
  syllabus: 'syllabu', curriculum: 'syllabu', topics: 'syllabu', module: 'syllabu', modules: 'syllabu',
  job: 'placement', jobs: 'placement', career: 'placement', careers: 'placement', internship: 'placement',
  phone: 'contact', call: 'contact', whatsapp: 'contact', email: 'contact', mail: 'contact', number: 'contact',
  teacher: 'instructor', trainer: 'instructor', mentor: 'instructor', faculty: 'instructor',
  long: 'duration', weeks: 'duration', months: 'duration', time: 'duration',
  discount: 'scholarship', discounts: 'scholarship', concession: 'scholarship', scholarships: 'scholarship',
  emi: 'instalment', installment: 'instalment', installments: 'instalment', instalments: 'instalment',
  refund: 'refund', refunds: 'refund', money: 'refund'
};

// Light normalisation: lowercase, split on non-letters/digits, drop stopwords
// and very short tokens, and fold simple English plurals / -ing / -ed forms so
// "courses" matches "course" and "learning" matches "learn".
export const tokenize = (text) => {
  const words = String(text || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9ऀ-ॿ+#.]+/).map((w) => w.replace(/^[.]+|[.]+$/g, ''));
  const out = [];
  for (let w of words) {
    if (w.length < 2 || STOPWORDS.has(w)) continue;
    if (SYNONYMS[w]) { out.push(SYNONYMS[w]); continue; }
    if (/^[a-z]+$/.test(w) && w.length > 4) {
      if (w.endsWith('ies')) w = `${w.slice(0, -3)}y`;
      else if (w.endsWith('ing') && w.length > 6) w = w.slice(0, -3);
      else if (w.endsWith('ed') && w.length > 5) w = w.slice(0, -2);
      else if (w.endsWith('es') && /(ss|sh|ch|x)es$/.test(w)) w = w.slice(0, -2);
      else if (w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
    }
    out.push(w);
  }
  return out;
};

const K1 = 1.4;
const B = 0.75;
const TITLE_BOOST = 2;   // words in a page title count extra

export class SearchIndex {
  constructor(chunks = []) {
    this.chunks = chunks;
    this.docs = chunks.map((c) => {
      const terms = [...tokenize(c.text)];
      for (let i = 0; i < TITLE_BOOST; i++) terms.push(...tokenize(c.title));
      const tf = new Map();
      for (const t of terms) tf.set(t, (tf.get(t) || 0) + 1);
      return { tf, len: terms.length };
    });
    this.df = new Map();
    for (const d of this.docs) for (const t of d.tf.keys()) this.df.set(t, (this.df.get(t) || 0) + 1);
    this.avgLen = this.docs.reduce((s, d) => s + d.len, 0) / Math.max(1, this.docs.length);
  }

  get size() { return this.chunks.length; }

  search(query, { limit = 6, maxPerDoc = 2 } = {}) {
    const qTerms = [...new Set(tokenize(query))];
    if (!qTerms.length || !this.docs.length) return [];
    const N = this.docs.length;
    const scored = [];
    this.docs.forEach((d, i) => {
      let score = 0;
      for (const t of qTerms) {
        const f = d.tf.get(t);
        if (!f) continue;
        const n = this.df.get(t) || 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        score += idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + B * (d.len / this.avgLen))));
      }
      if (score > 0) scored.push({ i, score });
    });
    scored.sort((a, b) => b.score - a.score);
    // Keep results varied: at most `maxPerDoc` chunks from the same page.
    const perDoc = new Map();
    const out = [];
    for (const { i, score } of scored) {
      const c = this.chunks[i];
      const key = `${c.source}:${c.docId}`;
      if ((perDoc.get(key) || 0) >= maxPerDoc) continue;
      perDoc.set(key, (perDoc.get(key) || 0) + 1);
      out.push({ ...c, score });
      if (out.length >= limit) break;
    }
    return out;
  }
}
