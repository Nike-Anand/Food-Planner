'use client'
import { useEffect, useState, useCallback } from 'react'
import { Dish } from '@/lib/types'
import DishCard from '@/components/DishCard'
import { Search, X, Clock, Leaf, Flame, BookOpen } from 'lucide-react'
import { useDebounce } from '@/lib/useDebounce'

const CUISINE_EMOJIS: Record<string, string> = {
  Indian: '🍛', 'South Indian': '🥘', Italian: '🍝', Chinese: '🥡',
  Thai: '🍜', Japanese: '🍱', Mexican: '🌮', American: '🍔',
  French: '🥐', Greek: '🫒', 'Middle Eastern': '🧆', Kashmiri: '🍖', 'Indo-Chinese': '🥢',
}

const FILTERS = [
  { id: 'all',    label: 'All Recipes' },
  { id: 'veg',    label: 'Vegetarian' },
  { id: 'quick',  label: 'Under 30 min' },
  { id: 'budget', label: 'Budget ₹150' },
]

export default function Home() {
  const [dishes, setDishes]         = useState<Dish[]>([])
  const [query, setQuery]           = useState('')
  const [loading, setLoading]       = useState(true)
  const [activeFilter, setFilter]   = useState('all')
  const [activeCuisine, setCuisine] = useState<string | null>(null)
  const debouncedQuery              = useDebounce(query, 300)

  const fetchDishes = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/dishes?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setDishes(Array.isArray(data) ? data : [])
    } catch { setDishes([]) }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => { fetchDishes(debouncedQuery) }, [debouncedQuery, fetchDishes])

  const filtered = dishes.filter(d => {
    if (activeFilter === 'veg'    && d.is_veg === false)  return false
    if (activeFilter === 'quick'  && d.cook_time > 30)    return false
    if (activeFilter === 'budget' && stableCost(d.id) > 150) return false
    if (activeCuisine && d.cuisine !== activeCuisine)     return false
    return true
  })

  const cuisines   = [...new Set(dishes.map(d => d.cuisine))]
  const hero       = dishes[0]
  const featured   = dishes.slice(1, 7)
  const quick      = dishes.filter(d => d.cook_time <= 25).slice(0, 6)
  const isFiltered = activeFilter !== 'all' || activeCuisine !== null || query !== ''

  const clear = () => { setFilter('all'); setCuisine(null); setQuery('') }

  return (
    <main style={{ minHeight: '100svh', background: '#F8F5EF', paddingBottom: '5rem' }}>

      {/* ── Masthead ─────────────────────────────────────────── */}
      <header style={{ background: '#1C1C1C', padding: '3rem 1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ color: '#B85C38', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Your Digital Cookbook
            </p>
            <h1 className="font-serif" style={{ color: '#F8F5EF', fontSize: '1.9rem', lineHeight: 1.1, fontWeight: 400 }}>
              Cook It<br />Yourself
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'rgba(248,245,239,0.4)', fontSize: '0.7rem' }}>
              {dishes.length > 0 ? `${dishes.length} recipes` : ''}
            </p>
            <p style={{ color: 'rgba(248,245,239,0.6)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
              {greeting()}
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(248,245,239,0.4)' }} />
          <input
            type="text"
            placeholder="Search recipes, cuisines…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%', paddingLeft: '2.5rem', paddingRight: query ? '2.5rem' : '1rem',
              paddingTop: '0.75rem', paddingBottom: '0.75rem',
              background: 'rgba(248,245,239,0.08)', border: '1px solid rgba(248,245,239,0.12)',
              color: '#F8F5EF', fontSize: '0.875rem', outline: 'none',
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}>
              <X size={14} style={{ color: 'rgba(248,245,239,0.4)' }} />
            </button>
          )}
        </div>
      </header>

      {/* ── Filter strip ─────────────────────────────────────── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2DDD5', overflowX: 'auto' }} className="no-scrollbar">
        <div style={{ display: 'flex', padding: '0 1.25rem' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                flexShrink: 0, padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 500,
                color: activeFilter === f.id ? '#B85C38' : '#7A7A7A',
                borderBottom: activeFilter === f.id ? '2px solid #B85C38' : '2px solid transparent',
                background: 'none', border: 'none', borderBottom: activeFilter === f.id ? '2px solid #B85C38' : '2px solid transparent',
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Skeleton /> : isFiltered ? (
        /* ── Search / filter results ─────────────────────────── */
        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#7A7A7A' }}>{filtered.length} recipes found</p>
            <button onClick={clear} style={{ fontSize: '0.78rem', color: '#B85C38', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <X size={12} /> Clear
            </button>
          </div>
          {filtered.length === 0 ? <Empty onClear={clear} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#E2DDD5' }}>
              {filtered.map(d => <DishCard key={d.id} dish={d} />)}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── Hero ─────────────────────────────────────────── */}
          {hero && (
            <section style={{ borderBottom: '1px solid #E2DDD5' }}>
              <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
                <SectionLabel>Editor&apos;s Pick</SectionLabel>
              </div>
              <DishCard dish={hero} variant="hero" />
            </section>
          )}

          {/* ── Featured horizontal ───────────────────────────── */}
          {featured.length > 0 && (
            <section style={{ borderBottom: '1px solid #E2DDD5', paddingBottom: '1.25rem' }}>
              <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <SectionLabel>Featured Recipes</SectionLabel>
                <span style={{ fontSize: '0.7rem', color: '#7A7A7A' }}>Scroll →</span>
              </div>
              <div style={{ display: 'flex', gap: '1px', paddingLeft: '1.25rem', overflowX: 'auto', background: '#E2DDD5' }} className="no-scrollbar">
                {featured.map(d => <DishCard key={d.id} dish={d} variant="featured" />)}
              </div>
            </section>
          )}

          {/* ── Cuisine filter row ────────────────────────────── */}
          <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2DDD5', padding: '1rem 1.25rem' }}>
            <SectionLabel>Browse by Cuisine</SectionLabel>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto' }} className="no-scrollbar">
              {cuisines.map(c => (
                <button
                  key={c}
                  onClick={() => setCuisine(ac => ac === c ? null : c)}
                  style={{
                    flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                    padding: '0.5rem 0.75rem',
                    background: activeCuisine === c ? '#1C1C1C' : '#F8F5EF',
                    border: `1px solid ${activeCuisine === c ? '#1C1C1C' : '#E2DDD5'}`,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{CUISINE_EMOJIS[c] ?? '🍽️'}</span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, color: activeCuisine === c ? '#F8F5EF' : '#3D3D3D', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>{c}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Quick & Easy ─────────────────────────────────── */}
          {quick.length > 0 && (
            <section style={{ borderBottom: '1px solid #E2DDD5', paddingBottom: '1.25rem' }}>
              <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={13} style={{ color: '#B85C38' }} />
                <SectionLabel>Quick &amp; Easy</SectionLabel>
                <span style={{ fontSize: '0.7rem', color: '#7A7A7A', marginLeft: 'auto' }}>Under 30 min</span>
              </div>
              <div style={{ display: 'flex', gap: '1px', paddingLeft: '1.25rem', overflowX: 'auto', background: '#E2DDD5' }} className="no-scrollbar">
                {quick.map(d => <DishCard key={d.id} dish={d} variant="compact" />)}
              </div>
            </section>
          )}

          {/* ── All dishes by cuisine ─────────────────────────── */}
          {cuisines.map(cuisine => {
            const group = dishes.filter(d => d.cuisine === cuisine)
            return (
              <section key={cuisine} style={{ borderBottom: '1px solid #E2DDD5' }}>
                <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>{CUISINE_EMOJIS[cuisine] ?? '🍽️'}</span>
                  <SectionLabel>{cuisine}</SectionLabel>
                  <span style={{ fontSize: '0.7rem', color: '#7A7A7A', marginLeft: 'auto' }}>{group.length} recipes</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#E2DDD5' }}>
                  {group.map(d => <DishCard key={d.id} dish={d} />)}
                </div>
              </section>
            )
          })}
        </>
      )}

      {/* ── Bottom nav ───────────────────────────────────────── */}
      <BottomNav />
    </main>
  )
}

/* ── Helpers ─────────────────────────────────────────────────── */
function stableCost(id: string): number {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return 80 + (seed % 121)
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning 👋'
  if (h < 17) return 'Good afternoon 👋'
  return 'Good evening 👋'
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3D3D3D' }}>
      {children}
    </p>
  )
}

function BottomNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '430px',
      background: '#1C1C1C', display: 'flex', alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 40,
    }}>
      {[
        { icon: <BookOpen size={20} />, label: 'Recipes', active: true },
        { icon: <Search size={20} />,   label: 'Search' },
        { icon: <Leaf size={20} />,     label: 'Veg' },
        { icon: <Flame size={20} />,    label: 'Non-Veg' },
      ].map(item => (
        <button key={item.label} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
          padding: '0.75rem 0', background: 'none', border: 'none', cursor: 'pointer',
          color: item.active ? '#B85C38' : 'rgba(248,245,239,0.4)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          {item.icon}
          <span style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.05em' }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function Skeleton() {
  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ height: '220px', background: '#EDE9E0', animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#E2DDD5' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: '180px', background: '#EDE9E0', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    </div>
  )
}

function Empty({ onClear }: { onClear: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1.25rem' }}>
      <p className="font-serif" style={{ fontSize: '1.5rem', color: '#1C1C1C', marginBottom: '0.5rem' }}>No recipes found</p>
      <p style={{ fontSize: '0.85rem', color: '#7A7A7A', marginBottom: '1.5rem' }}>Try a different search or clear your filters</p>
      <button onClick={onClear} style={{
        background: '#1C1C1C', color: '#F8F5EF', padding: '0.75rem 2rem',
        fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        Clear Filters
      </button>
    </div>
  )
}
