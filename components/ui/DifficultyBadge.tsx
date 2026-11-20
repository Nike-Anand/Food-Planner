'use client'
const MAP = {
  Easy: 'bg-green-50 text-green-700',
  Medium: 'bg-amber-50 text-amber-700',
  Hard: 'bg-red-50 text-red-700',
} as const

export default function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  const d = (difficulty || 'Easy') as keyof typeof MAP
  const cls = MAP[d] || MAP.Easy
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-sm ${cls}`}>
      {d}
    </span>
  )
}
