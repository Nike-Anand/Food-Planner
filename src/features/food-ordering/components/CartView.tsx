'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Bike,
  Clock,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import type { CartItem, CartItemSource } from '@/types/shared'
import { formatCurrency } from '@/lib/currency'

interface CartItemsSectionProps {
  title: string
  items: CartItem[]
  subtotal: number
  onUpdateQuantity: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
}

function CartItemsSection({
  title,
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

interface CartViewProps {
  sourceScope?: CartItemSource
}

export function CartView({ sourceScope }: CartViewProps = {}) {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const orders = useCartStore((state) => state.orders)
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const foodSubtotal = useCartStore((state) => state.getSubtotal('food_menu'))
  const ingredientSubtotal = useCartStore((state) => state.getSubtotal('recipe_ingredient'))
  const clearCart = useCartStore((state) => state.clearCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const visibleItems = sourceScope
    ? items.filter((item) => item.source === sourceScope)
    : items
  const visibleOrders = sourceScope
    ? orders.filter((order) => order.source === sourceScope)
    : orders
  const totalCount = visibleItems.reduce((count, item) => count + item.quantity, 0)
  const foodItems = visibleItems.filter((item) => item.source === 'food_menu')
  const ingredientItems = visibleItems.filter((item) => item.source === 'recipe_ingredient')
  const activeOrders = visibleOrders.filter((order) => order.status !== 'delivered')
  const hasItems = visibleItems.length > 0
  const cartTitle =
    sourceScope === 'food_menu'
      ? 'Food Cart'
      : sourceScope === 'recipe_ingredient'
        ? 'Recipe Ingredient Cart'
        : 'My Cart'
  const emptyDescription =
    sourceScope === 'food_menu'
      ? 'Add dishes from the food catalog to see them here.'
      : sourceScope === 'recipe_ingredient'
        ? 'Add missing recipe ingredients to see them here.'
        : 'Add delicious food or recipe ingredients to order.'
  const browseHref =
    sourceScope === 'recipe_ingredient' ? '/recipe' : '/order'
  const browseLabel =
    sourceScope === 'recipe_ingredient' ? 'Return to Recipe Maker' : 'Browse Food Catalog'

  return (
    <section className="space-y-4">
      {activeOrders.length > 0 && (
        <div className="space-y-2">
          {activeOrders.map((order) => {
            const orderLabel =
              order.source === 'food_menu'
                ? 'Food order'
                : order.source === 'recipe_ingredient'
                  ? 'Recipe ingredient order'
                  : 'Combined legacy order'
            return (
              <div
                key={order.orderId}
                className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
                      <Bike className="h-4 w-4 text-white" />
                    </span>
                    <div>
                      <p className="text-xs font-black tracking-wide uppercase">
                        Active {orderLabel}
                      </p>
                      <p className="text-[11px] text-emerald-100">
                        {order.status.replace('_', ' ')} ·{' '}
                        {formatCurrency(order.grandTotal, 'INR')}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/order-status/${order.orderId}${sourceScope ? `?source=${sourceScope}` : ''}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
                  >
                    Track <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{cartTitle}</h1>
          <p className="text-xs text-slate-500">
            {hasHydrated ? `${totalCount} ${totalCount === 1 ? 'item' : 'items'} in your cart` : 'Restoring cart…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!sourceScope && orders.length > 0 && (
            <Link
              href="/orders"
              className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <Clock className="h-3.5 w-3.5" />
              Order History ({orders.length})
            </Link>
          )}
          {hasItems && (
            <button
              type="button"
              onClick={() => clearCart(sourceScope)}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          )}
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
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-bold text-sm text-slate-800">Your cart is empty</p>
            <p className="mt-1 text-xs text-slate-400">{emptyDescription}</p>
            <Link
              href={browseHref}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 text-xs font-bold text-white shadow-xs hover:bg-orange-700 active:scale-95 transition-all"
            >
              {browseLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Past Orders List right on Empty Cart */}
          {visibleOrders.length > 0 && (
            <section className="space-y-2.5 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Recent Orders ({visibleOrders.length})
              </h2>
              <div className="space-y-2.5">
                {visibleOrders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900">{ord.orderId}</span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-700">
                          {ord.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {ord.items.length} items · {formatCurrency(ord.grandTotal, 'INR')}
                      </p>
                    </div>
                    <Link
                      href={`/order-status/${ord.orderId}${sourceScope ? `?source=${sourceScope}` : ''}`}
                      className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-200"
                    >
                      View Status
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {foodItems.length > 0 && (
            <CartItemsSection
              title="Food Menu Items"
              items={foodItems}
              subtotal={foodSubtotal}
              onUpdateQuantity={(id, delta) => updateQuantity(id, delta, sourceScope)}
              onRemoveItem={(id) => removeItem(id, sourceScope)}
            />
          )}
          {ingredientItems.length > 0 && (
            <CartItemsSection
              title="Recipe Ingredients"
              items={ingredientItems}
              subtotal={ingredientSubtotal}
              onUpdateQuantity={(id, delta) => updateQuantity(id, delta, sourceScope)}
              onRemoveItem={(id) => removeItem(id, sourceScope)}
            />
          )}

          <footer className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
            <p className="text-[11px] text-slate-400">
              {sourceScope
                ? `This cart contains only ${sourceScope === 'food_menu' ? 'food menu items' : 'recipe ingredients'}.`
                : 'Checkout is separate for food orders and recipe ingredients.'}
            </p>
            {foodItems.length > 0 && (
              <button
                type="button"
                onClick={() => router.push('/checkout?source=food_menu')}
                className="min-h-12 w-full rounded-xl bg-orange-600 px-4 text-sm font-extrabold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                Checkout Food Order · {formatCurrency(foodSubtotal, 'INR')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            {ingredientItems.length > 0 && (
              <button
                type="button"
                onClick={() => router.push('/checkout?source=recipe_ingredient')}
                className="min-h-12 w-full rounded-xl bg-amber-600 px-4 text-sm font-extrabold text-white shadow-md shadow-amber-600/20 hover:bg-amber-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                Checkout Recipe Ingredients · {formatCurrency(ingredientSubtotal, 'INR')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </footer>
        </div>
      )}
    </section>
  )
}
