import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cook It Yourself',
  description: 'Discover recipes, cook at home, save money — your personal digital cookbook.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#F8F5EF', margin: 0 }}>
        <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100svh', background: '#F8F5EF', position: 'relative' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
