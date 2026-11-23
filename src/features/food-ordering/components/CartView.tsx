'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, ArrowRightCircle } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import type { CartItem, CartItemSource } from '@/types/shared'
import { formatCurrency } from '@/lib/currency'

interface CartItemsSectionProps {
  title: string
  source: CartItemSource
  items: CartItem[]
  subtotal: number
  onUpdateQuantity: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
}

function CartItemsSection({
  title,
  source,
  items,
  subtotal,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemsSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <header className="border-b border-slate-100 px-4 py-3 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <span className="text-xs font-bold text-slate-800">
          {formatCurrency(subtotal, 'INR')}
        </span>
      </header>

      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={`${item.source}:${item.id}`} className="flex gap-3 p-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ShoppingBag className="h-5 w-5 text-slate-400" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">{item.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {item.source === 'food_menu' ? 'Menu item' : 'Recipe ingredient'}
                  </p>
                </div>
                <p className="shrink-0 text-xs font-bold text-slate-900">
                  {formatCurrency(item.price * item.quantity, item.currency || 'INR')}
                </p>
              </div>
              <div className="mt-1.5 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  aria-label={`Decrease quantity of ${item.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="min-w-6 text-center text-xs font-bold text-slate-800">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  aria-label={`Increase quantity of ${item.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 active:scale-95"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function CartView() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const totalCount = useCartStore((state) => state.getTotalCount())
  const subtotal = useCartStore((state) => state.getSubtotal())
  const foodSubtotal = useCartStore((state) => state.getSubtotal('food_menu'))
  const ingredientSubtotal = useCartStore((state) => state.getSubtotal('recipe_ingredient'))
  const clearCart = useCartStore((state) => state.clearCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const foodItems = items.filter((item) => item.source === 'food_menu')
  const ingredientItems = items.filter((item) => item.source === 'recipe_ingredient')
  const hasItems = items.length > 0

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Cart</h1>
          <p className="text-xs text-slate-500">
            {hasHydrated ? `${totalCount} ${totalCount === 1 ? 'item' : 'items'} in your cart` : 'Restoring cart…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasItems && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          )}
          <ShoppingBag className="h-5 w-5 text-orange-600" aria-hidden="true" />
        </div>
      </header>

      {!hasHydrated ? (
        <div
          className="rounded-2xl border border-slate-100 bg-white px-5 py-10 text-center text-xs text-slate-500"
          role="status"
          aria-live="polite"
        >
          Restoring your cart…
        </div>
      ) : !hasItems ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-bold text-sm text-slate-800">Your cart is empty</p>
          <p className="mt-1 text-xs text-slate-400">Add delicious food or recipe ingredients to order.</p>
          <Link
            href="/order"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 text-xs font-bold text-white shadow-xs hover:bg-orange-700"
          >
            Browse Food Catalog <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {foodItems.length > 0 && (
            <CartItemsSection
              title="Food Menu Items"
              source="food_menu"
              items={foodItems}
              subtotal={foodSubtotal}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
            />
          )}
          {ingredientItems.length > 0 && (
            <CartItemsSection
              title="Recipe Ingredients"
              source="recipe_ingredient"
              items={ingredientItems}
              subtotal={ingredientSubtotal}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
            />
          )}

          {/* Unified Order Total & Checkout CTA */}
          <footer className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
            <div className="flex justify-between text-sm font-extrabold text-slate-900">
              <span>Cart Subtotal</span>
              <span className="text-orange-600">{formatCurrency(subtotal, 'INR')}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Taxes and delivery fee will be calculated at checkout.
            </p>
            <button
              type="button"
              onClick={() => router.push('/checkout')}
              className="min-h-12 w-full rounded-xl bg-orange-600 px-4 text-sm font-extrabold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </button>
          </footer>
        </div>
      )}
    </section>
  )
}
