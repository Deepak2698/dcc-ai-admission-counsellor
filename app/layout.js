import './globals.css'

export const metadata = {
  title: 'AI Admission Counsellor for Coaching Institutes | DeCODE Crafters',
  description:
    'A website chatbot that answers course, fee, scholarship and admission questions 24/7 from your institute’s own content. Embed it on any website with one line.',
  metadataBase: new URL('https://dcc-ai-admission-counsellor.vercel.app'),
  openGraph: { images: ['/og.png'] }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-navy-950 font-sans text-white antialiased">{children}</body>
    </html>
  )
}
