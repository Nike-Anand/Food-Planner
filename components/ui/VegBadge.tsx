'use client'
import { Leaf, Flame } from 'lucide-react'

export default function VegBadge({ isVeg, size = 'sm' }: { isVeg?: boolean; size?: 'xs' | 'sm' }) {
  const p = size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
  if (isVeg !== false) {
    return (
      <span className={`inline-flex items-center gap-0.5 bg-[#168B45] text-white font-bold rounded-sm ${p}`}>
        <Leaf size={size === 'xs' ? 7 : 9} /> VEG
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-0.5 bg-red-600 text-white font-bold rounded-sm ${p}`}>
      <Flame size={size === 'xs' ? 7 : 9} /> NON-VEG
    </span>
  )
}
