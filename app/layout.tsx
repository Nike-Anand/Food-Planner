import type { Metadata, Viewport } from 'next'
import './globals.css'
import { isCookYourselfEnabled } from '@/lib/flagsmith'

export const metadata: Metadata = {
  title: 'Cook It Yourself',
  description: 'Discover recipes, cook at home, save money — your personal digital cookbook.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let featureEnabled = false
  try {
    featureEnabled = await isCookYourselfEnabled()
  } catch {
    featureEnabled = false
  }

  if (!featureEnabled) {
    return (
      <html lang="en">
        <body style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#F8F5EF', margin: 0 }}>
          <div style={{
            minHeight: '100svh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center',
            background: '#1C1C1C',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🍳</div>
            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '2rem', color: '#F8F5EF', marginBottom: '0.75rem', fontWeight: 400 }}>
              Cook It Yourself
            </h1>
            <p style={{ color: 'rgba(248,245,239,0.55)', fontSize: '0.9rem', maxWidth: '22rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              This feature is currently paused. We&apos;re putting the finishing touches on something delicious.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(248,245,239,0.08)', padding: '0.5rem 1.25rem', borderRadius: '999px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#B85C38', animation: 'pulse 2s infinite' }} />
              <span style={{ color: 'rgba(248,245,239,0.5)', fontSize: '0.8rem' }}>Coming soon</span>
            </div>
          </div>
        </body>
      </html>
    )
  }

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
