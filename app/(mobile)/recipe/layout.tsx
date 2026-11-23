import Link from 'next/link'
import { connection } from 'next/server'
import type { ReactNode } from 'react'
import { isCookYourselfEnabled } from '@/lib/flagsmith'

export default async function RecipeLayout({ children }: { children: ReactNode }) {
  await connection()

  let isEnabled = false
  try {
    isEnabled = await isCookYourselfEnabled()
  } catch (error) {
    console.error('Failed to evaluate the Cook It Yourself feature flag.', error)
  }

  if (!isEnabled) {
    return (
      <section className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-10 text-center text-white">
        <span className="text-4xl" aria-hidden="true">🍳</span>
        <h1 className="text-xl font-bold">Cook It Yourself is currently unavailable</h1>
        <p className="max-w-sm text-sm text-slate-300">
          The recipe feature is paused. Food ordering is still available.
        </p>
        <Link
          href="/order"
          className="mt-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Browse food
        </Link>
      </section>
    )
  }

  return children
}
