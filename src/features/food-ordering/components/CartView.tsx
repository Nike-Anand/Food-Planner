'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export function CartView() {
  const items = useCartStore((state) => state.items)
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const totalCount = useCartStore((state) => state.getTotalCount())
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)

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
          <p className="text-sm text-slate-500">
            {hasHydrated ? `${totalCount} ${totalCount === 1 ? 'item' : 'items'}` : 'Restoring cart…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasItems && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex min-h-12 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear cart
            </button>
          )}
          <ShoppingBag className="h-6 w-6 text-orange-600" aria-hidden="true" />
        </div>
      </header>

      {!hasHydrated ? (
        <div
          className="rounded-2xl border border-slate-100 bg-white px-5 py-10 text-center text-sm text-slate-500"
          role="status"
          aria-live="polite"
        >
          Restoring your cart…
        </div>
      ) : !hasItems ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
          <p className="font-semibold text-slate-800">Your cart is empty</p>
          <p className="mt-1 text-sm text-slate-500">Add food or recipe ingredients to get started.</p>
          <Link
            href="/order"
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white"
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
                className="flex gap-3 p-4"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.source === 'food_menu' ? 'Food menu' : 'Recipe ingredient'}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-800">
                      {item.source === 'food_menu' ? '₹' : '$'}
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="ml-1 flex h-12 w-12 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
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
