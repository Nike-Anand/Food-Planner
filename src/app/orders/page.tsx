'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/currency';
import { Clock, ArrowRight, ShoppingBag } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  placed:      'bg-blue-50 text-blue-700',
  preparing:   'bg-amber-50 text-amber-700',
  on_the_way:  'bg-orange-50 text-orange-700',
  delivered:   'bg-emerald-50 text-emerald-700',
};

export default function OrdersPage() {
  const orders = useCartStore((state) => state.orders);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center space-y-3">
          <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
          <p className="font-bold text-sm text-slate-800">No orders yet</p>
          <p className="text-xs text-slate-400">Your order history will appear here.</p>
          <Link
            href="/order"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 text-xs font-bold text-white hover:bg-orange-700 transition-all"
          >
            Browse Food <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.orderId} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-bold text-slate-900">{order.orderId}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(order.placedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${STATUS_STYLES[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{order.items.length} items · {formatCurrency(order.grandTotal, 'INR')}</span>
                <Link
                  href={`/order-status/${order.orderId}`}
                  className="flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700"
                >
                  Track <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
