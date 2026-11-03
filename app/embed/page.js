// Chat only, shown inside other websites by public/widget.js.
import Chat from '@/components/Chat'

export const metadata = { robots: { index: false } }

export default function Embed() {
  return (
    <main className="h-screen p-0">
      <Chat compact />
    </main>
  )
}
