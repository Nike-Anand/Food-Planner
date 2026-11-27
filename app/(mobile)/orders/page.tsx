'use client'

import Link from 'next/link'
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/currency'

export default function OrdersPage() {
  const orders = useCartStore((state) => state.orders)
  const hasHydrated = useCartStore((state) => state.hasHydrated)

  if (!hasHydrated) {
    return (
      <div className="py-12 text-center text-xs text-slate-500">
        Loading orders…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
      </div>

      <header>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
        <p className="text-xs text-slate-500">
          Track food orders and recipe ingredient orders separately.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Clock className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-sm font-bold text-slate-800">No orders placed yet</h2>
          <p className="mt-1 text-xs text-slate-400">
            Food and recipe ingredient orders will appear here separately.
          </p>
          <Link
            href="/order"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-600 px-5 text-xs font-bold text-white hover:bg-orange-700"
          >
            Order Food Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.orderId}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                <div>
                  <span className="font-mono text-xs font-black text-slate-900">{ord.orderId}</span>
                  <p className="text-[10px] font-semibold text-orange-700">
                    {ord.source === 'food_menu'
                      ? 'Food order'
                      : ord.source === 'recipe_ingredient'
                        ? 'Recipe ingredient order'
                        : 'Combined legacy order'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(ord.placedAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    ord.status === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-orange-50 text-orange-600 animate-pulse'
                  }`}
                >
                  {ord.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                {ord.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(item.price * item.quantity, 'INR')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
                <div>
                  <p className="text-[10px] text-slate-400">Total Paid</p>
                  <p className="text-xs font-black text-slate-900">{formatCurrency(ord.grandTotal, 'INR')}</p>
                </div>
                <Link
                  href={`/order-status/${ord.orderId}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-orange-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-orange-700 active:scale-95 transition-all"
                >
                  Live Status <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
