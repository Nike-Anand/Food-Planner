'use client'
import { Dish } from '@/lib/types'
import { Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const FALLBACK = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'

function stableCost(id: string): number {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return 80 + (seed % 121)
}

function getDiff(t: number) {
  if (t <= 20) return 'Easy'
  if (t <= 45) return 'Medium'
  return 'Hard'
}

/* ── Hero card — full-width editorial strip ── */
function HeroCard({ dish }: { dish: Dish }) {
  const cost = stableCost(dish.id)
  return (
    <Link href={`/dish/${dish.id}`} className="block">
      <div className="relative w-full h-[52vw] max-h-[220px] overflow-hidden" style={{ background: '#EDE9E0' }}>
        <Image src={dish.image_url || FALLBACK} alt={dish.name} fill className="object-cover" unoptimized priority />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,28,28,0.72) 0%, transparent 55%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-xs font-medium mb-1" style={{ color: '#B85C38', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{dish.cuisine}</p>
          <h3 className="font-serif text-white text-xl leading-tight">{dish.name}</h3>
          <div className="flex items-center gap-3 mt-1.5" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>
            <span className="flex items-center gap-1"><Clock size={11} />{dish.cook_time} min</span>
            <span>·</span>
            <span>~₹{cost}</span>
            <span>·</span>
            <span>{getDiff(dish.cook_time)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Featured card — tall portrait for horizontal scroll ── */
function FeaturedCard({ dish }: { dish: Dish }) {
  const cost = stableCost(dish.id)
  return (
    <Link href={`/dish/${dish.id}`} className="block flex-shrink-0" style={{ width: '52vw', maxWidth: '210px' }}>
      <div className="relative overflow-hidden" style={{ borderRadius: 0, background: '#EDE9E0' }}>
        <div className="relative w-full" style={{ paddingBottom: '120%' }}>
          <Image src={dish.image_url || FALLBACK} alt={dish.name} fill className="object-cover" unoptimized />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,28,28,0.75) 0%, transparent 50%)' }} />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-[10px] font-medium mb-0.5" style={{ color: '#B85C38', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{dish.cuisine}</p>
            <h3 className="font-serif text-white text-sm leading-snug line-clamp-2">{dish.name}</h3>
            <div className="flex items-center gap-2 mt-1" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }}>
              <span className="flex items-center gap-0.5"><Clock size={9} />{dish.cook_time}m</span>
              <span>~₹{cost}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Grid card — editorial two-column ── */
function GridCard({ dish }: { dish: Dish }) {
  const cost = stableCost(dish.id)
  return (
    <Link href={`/dish/${dish.id}`} className="block">
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2DDD5' }}>
        <div className="relative w-full overflow-hidden" style={{ paddingBottom: '68%' }}>
          <Image src={dish.image_url || FALLBACK} alt={dish.name} fill className="object-cover" unoptimized />
        </div>
        <div className="p-2.5">
          <p className="text-[9px] font-semibold mb-0.5" style={{ color: '#B85C38', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{dish.cuisine}</p>
          <h3 className="font-serif text-sm leading-snug line-clamp-2" style={{ color: '#1C1C1C' }}>{dish.name}</h3>
          <div className="flex items-center justify-between mt-1.5" style={{ color: '#7A7A7A', fontSize: '0.65rem' }}>
            <span className="flex items-center gap-0.5"><Clock size={9} />{dish.cook_time} min</span>
            <span style={{ color: '#B85C38', fontWeight: 600 }}>~₹{cost}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Compact card — horizontal list item ── */
function CompactCard({ dish }: { dish: Dish }) {
  const cost = stableCost(dish.id)
  return (
    <Link href={`/dish/${dish.id}`} className="block flex-shrink-0" style={{ width: '140px' }}>
      <div style={{ background: '#FFFFFF', border: '1px solid #E2DDD5' }}>
        <div className="relative w-full overflow-hidden" style={{ paddingBottom: '75%' }}>
          <Image src={dish.image_url || FALLBACK} alt={dish.name} fill className="object-cover" unoptimized />
        </div>
        <div className="p-2">
          <h3 className="font-serif text-xs leading-snug line-clamp-2" style={{ color: '#1C1C1C' }}>{dish.name}</h3>
          <div className="flex items-center justify-between mt-1" style={{ color: '#7A7A7A', fontSize: '0.6rem' }}>
            <span className="flex items-center gap-0.5"><Clock size={8} />{dish.cook_time}m</span>
            <span style={{ color: '#B85C38', fontWeight: 600 }}>~₹{cost}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function DishCard({ dish, variant = 'grid' }: {
  dish: Dish
  variant?: 'grid' | 'featured' | 'compact' | 'hero'
}) {
  if (variant === 'hero')     return <HeroCard dish={dish} />
  if (variant === 'featured') return <FeaturedCard dish={dish} />
  if (variant === 'compact')  return <CompactCard dish={dish} />
  return <GridCard dish={dish} />
}
