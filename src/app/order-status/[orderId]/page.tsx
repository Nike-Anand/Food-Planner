'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/currency';
import { CheckCircle, Clock, Bike, ChefHat, Package, ArrowLeft } from 'lucide-react';
import type { ActiveOrder } from '@/store/cartStore';

const STEPS: { status: ActiveOrder['status']; label: string; icon: React.ElementType }[] = [
  { status: 'placed',     label: 'Order Placed',   icon: Package },
  { status: 'preparing',  label: 'Preparing',      icon: ChefHat },
  { status: 'on_the_way', label: 'On the Way',     icon: Bike },
  { status: 'delivered',  label: 'Delivered',      icon: CheckCircle },
];

const STATUS_SEQUENCE: ActiveOrder['status'][] = ['placed', 'preparing', 'on_the_way', 'delivered'];

export default function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const order = useCartStore(
    (s) =>
      s.orders.find((storedOrder) => storedOrder.orderId === orderId) ??
      (s.activeOrder?.orderId === orderId ? s.activeOrder : undefined)
  );
  const updateOrderStatus = useCartStore((s) => s.updateOrderStatus);

  // Simulate order progression
  useEffect(() => {
    if (!hasHydrated || !order || order.status === 'delivered') return;

    const currentIdx = STATUS_SEQUENCE.indexOf(order.status);
    if (currentIdx === STATUS_SEQUENCE.length - 1) return;

    const timer = setTimeout(() => {
      const nextStatus = STATUS_SEQUENCE[currentIdx + 1];
      updateOrderStatus(orderId, nextStatus);
    }, 8000);

    return () => clearTimeout(timer);
  }, [hasHydrated, order, orderId, updateOrderStatus]);

  if (!hasHydrated) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm font-bold text-slate-700">Loading your order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm font-bold text-slate-700">Order not found</p>
        <Link href="/orders" className="text-xs text-orange-600 font-semibold">← Back to Orders</Link>
      </div>
    );
  }

  const currentIdx = STATUS_SEQUENCE.indexOf(order.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-base font-extrabold text-slate-900">Order Status</h1>
          <p className="text-[11px] font-mono text-slate-400">{order.orderId}</p>
        </div>
      </div>

      {/* Status Progress */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={step.status} className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${done ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'} ${active ? 'ring-2 ring-orange-300 ring-offset-1' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className={`text-[9px] font-bold text-center leading-tight ${done ? 'text-orange-600' : 'text-slate-400'}`}>{step.label}</p>
                {i < STEPS.length - 1 && (
                  <div className="absolute" />
                )}
              </div>
            );
          })}
        </div>

        {order.status !== 'delivered' && (
          <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2.5">
            <Clock className="w-4 h-4 text-orange-500 shrink-0" />
            <p className="text-xs text-orange-800 font-medium">
              Estimated delivery in ~{order.estimatedDeliveryMinutes} mins
            </p>
          </div>
        )}

        {order.status === 'delivered' && (
          <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-800 font-bold">Your order has been delivered! Enjoy 🎉</p>
          </div>
        )}
      </section>

      {/* Delivery Info */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
        <h2 className="text-sm font-bold text-slate-900">Delivery To</h2>
        <p className="text-xs font-semibold text-slate-800">{order.deliveryDetails.name}</p>
        <p className="text-xs text-slate-500">{order.deliveryDetails.address}</p>
        <p className="text-xs text-slate-500">{order.deliveryDetails.phone}</p>
      </section>

      {/* Items */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
        <h2 className="text-sm font-bold text-slate-900">Items ({order.items.length})</h2>
        <div className="space-y-1.5">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs text-slate-700">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-semibold">{formatCurrency(item.price * item.quantity, 'INR')}</span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-extrabold text-slate-900">
          <span>Grand Total</span>
          <span className="text-orange-600">{formatCurrency(order.grandTotal, 'INR')}</span>
        </div>
      </section>

      <Link href="/order" className="block w-full text-center py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all">
        Order Again
      </Link>
    </div>
  );
}
