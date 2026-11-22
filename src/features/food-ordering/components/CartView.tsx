'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export function CartView() {
  const items = useCartStore((state) => state.items)
  const totalCount = useCartStore((state) => state.getTotalCount())

  const foodSubtotal = items.reduce(
    (total, item) => total + (item.source === 'food_menu' ? item.price * item.quantity : 0),
    0
  )
  const ingredientSubtotal = items.reduce(
    (total, item) => total + (item.source === 'recipe_ingredient' ? item.price * item.quantity : 0),
    0
  )
  const hasItems = items.length > 0
  const hasMultipleCurrencies = foodSubtotal > 0 && ingredientSubtotal > 0

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Cart</h1>
          <p className="text-sm text-slate-500">{totalCount} items</p>
        </div>
        <ShoppingBag className="h-6 w-6 text-orange-600" aria-hidden="true" />
      </header>

      {!hasItems ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
          <p className="font-semibold text-slate-800">Your cart is empty</p>
          <p className="mt-1 text-sm text-slate-500">Add food or recipe ingredients to get started.</p>
          <Link
            href="/order"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Browse food <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
            {items.map((item) => (
              <li
                key={`${item.source}:${item.id}`}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.source === 'food_menu' ? 'Food menu' : 'Recipe ingredient'} · Qty {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-slate-800">
                  {item.source === 'food_menu' ? '₹' : '$'}
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>

          <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
            <h2 className="text-sm font-bold text-slate-900">
              {hasMultipleCurrencies ? 'Subtotals' : 'Subtotal'}
            </h2>
            {foodSubtotal > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Food menu</span>
                <span>₹{foodSubtotal.toFixed(2)}</span>
              </div>
            )}
            {ingredientSubtotal > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Recipe ingredients</span>
                <span>${ingredientSubtotal.toFixed(2)}</span>
              </div>
            )}
            {hasMultipleCurrencies && (
              <p className="text-xs text-slate-500">
                Totals are shown separately because the sample data uses different currencies.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}
