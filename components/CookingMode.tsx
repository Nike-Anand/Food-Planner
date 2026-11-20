'use client'
import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Timer, CheckCircle, BookOpen } from 'lucide-react'
import { Ingredient } from '@/lib/types'

type Props = { dishName: string; steps: string[]; ingredients: Ingredient[]; onClose: () => void }

export default function CookingMode({ dishName, steps, ingredients, onClose }: Props) {
  const [current, setCurrent]           = useState(0)
  const [timerSec, setTimerSec]         = useState(0)
  const [running, setRunning]           = useState(false)
  const [showIng, setShowIng]           = useState(false)
  const [completed, setCompleted]       = useState<Set<number>>(new Set())
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) { ref.current = setInterval(() => setTimerSec(s => s + 1), 1000) }
    else { if (ref.current) clearInterval(ref.current) }
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const done = completed.has(current)
  const pct  = Math.round((completed.size / steps.length) * 100)

  const next = () => {
    setCompleted(p => new Set([...p, current]))
    if (current < steps.length - 1) setCurrent(c => c + 1)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#1C1C1C', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3rem 1.25rem 1rem', flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B85C38', marginBottom: '0.25rem' }}>Cooking Mode</p>
          <p className="font-serif" style={{ fontSize: '1.25rem', color: '#F8F5EF', fontWeight: 400 }}>{dishName}</p>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, background: 'rgba(248,245,239,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={18} color="#F8F5EF" />
        </button>
      </div>

      {/* Progress */}
      <div style={{ padding: '0 1.25rem 1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(248,245,239,0.4)' }}>Step {current + 1} of {steps.length}</span>
          <span style={{ fontSize: '0.7rem', color: 'rgba(248,245,239,0.4)' }}>{pct}% complete</span>
        </div>
        <div style={{ height: 2, background: 'rgba(248,245,239,0.1)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: '#B85C38', width: `${pct}%`, transition: 'width 0.4s ease' }} />
        </div>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 4, marginTop: '0.75rem', overflowX: 'auto' }} className="no-scrollbar">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                flexShrink: 0, height: 4, borderRadius: 2, border: 'none', cursor: 'pointer',
                width: i === current ? 24 : completed.has(i) ? 16 : 12,
                background: completed.has(i) ? '#78836B' : i === current ? '#B85C38' : 'rgba(248,245,239,0.15)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Step card */}
      <div style={{ flex: 1, padding: '0 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{
          padding: '1.5rem',
          background: done ? 'rgba(120,131,107,0.15)' : 'rgba(248,245,239,0.05)',
          border: `1px solid ${done ? 'rgba(120,131,107,0.3)' : 'rgba(248,245,239,0.08)'}`,
          transition: 'all 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? '#78836B' : '#B85C38', flexShrink: 0,
            }}>
              {done ? <CheckCircle size={18} color="#F8F5EF" /> : <span style={{ color: '#F8F5EF', fontWeight: 700, fontSize: '1rem' }}>{current + 1}</span>}
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', color: 'rgba(248,245,239,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Step {current + 1}</p>
              {done && <p style={{ fontSize: '0.7rem', color: '#78836B', fontWeight: 600 }}>✓ Completed</p>}
            </div>
          </div>
          <p style={{ fontSize: '1rem', color: '#F8F5EF', lineHeight: 1.7, fontWeight: 400 }}>{steps[current]}</p>
        </div>
      </div>

      {/* Timer */}
      <div style={{ padding: '0.75rem 1.25rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: 'rgba(248,245,239,0.05)', border: '1px solid rgba(248,245,239,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Timer size={16} color="#B85C38" />
            <span style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: '#F8F5EF', letterSpacing: '0.05em' }}>{fmt(timerSec)}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setRunning(r => !r)}
              style={{ padding: '0.4rem 1rem', background: running ? 'rgba(248,245,239,0.1)' : '#B85C38', border: 'none', color: '#F8F5EF', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => { setTimerSec(0); setRunning(false) }}
              style={{ padding: '0.4rem 0.75rem', background: 'rgba(248,245,239,0.06)', border: 'none', color: 'rgba(248,245,239,0.5)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients toggle */}
      {ingredients.length > 0 && (
        <div style={{ padding: '0 1.25rem 0.5rem', flexShrink: 0 }}>
          <button
            onClick={() => setShowIng(s => !s)}
            style={{ width: '100%', padding: '0.6rem', background: 'rgba(248,245,239,0.05)', border: '1px solid rgba(248,245,239,0.08)', color: 'rgba(248,245,239,0.6)', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            <BookOpen size={13} /> {showIng ? 'Hide' : 'View'} Ingredients ({ingredients.length})
          </button>
          {showIng && (
            <div style={{ marginTop: 4, background: 'rgba(248,245,239,0.04)', border: '1px solid rgba(248,245,239,0.08)', maxHeight: 120, overflowY: 'auto', padding: '0.5rem 0.875rem' }} className="no-scrollbar">
              {ingredients.map(ing => (
                <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(248,245,239,0.05)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(248,245,239,0.7)' }}>{ing.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(248,245,239,0.35)' }}>{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1.25rem', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          style={{ flex: 1, padding: '0.875rem', background: 'rgba(248,245,239,0.06)', border: '1px solid rgba(248,245,239,0.1)', color: 'rgba(248,245,239,0.6)', fontSize: '0.875rem', fontWeight: 600, cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        {current < steps.length - 1 ? (
          <button
            onClick={next}
            style={{ flex: 1, padding: '0.875rem', background: '#F8F5EF', border: 'none', color: '#1C1C1C', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => { next(); onClose() }}
            style={{ flex: 1, padding: '0.875rem', background: '#78836B', border: 'none', color: '#F8F5EF', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            <CheckCircle size={16} /> Done!
          </button>
        )}
      </div>
    </div>
  )
}
