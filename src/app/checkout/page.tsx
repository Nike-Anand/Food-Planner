'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/currency';
import { ArrowRight, Bike, Clock } from 'lucide-react';
import type { DeliveryDetails } from '@/store/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const createOrder = useCartStore((s) => s.createOrder);

  const [form, setForm] = useState<DeliveryDetails>({
    name: '',
    phone: '',
    address: '',
    deliveryMethod: 'standard',
    paymentMethod: 'upi',
    notes: '',
  });
  const [isPlacing, setIsPlacing] = useState(false);

  const deliveryFee = form.deliveryMethod === 'express' ? 49 : 25;
  const taxes = Math.round(subtotal * 0.05) + 15;
  const grandTotal = subtotal + deliveryFee + taxes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacing(true);
    const order = await createOrder(form);
    router.push(`/order-status/${order.orderId}`);
  };

  if (items.length === 0) {
    router.replace('/cart');
    return null;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Delivery Details */}
        <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Delivery Details</h2>

          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
            { label: 'Phone', key: 'phone', type: 'tel', placeholder: '10-digit mobile number' },
            { label: 'Address', key: 'address', type: 'text', placeholder: 'Flat, street, area, city' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
              <input
                required
                type={type}
                placeholder={placeholder}
                value={form[key as keyof DeliveryDetails] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          ))}

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Special Notes</label>
            <input
              type="text"
              placeholder="Allergies, instructions..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </section>

        {/* Delivery Method */}
        <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Delivery Speed</h2>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'standard', label: 'Standard', sub: '~30 mins', fee: '₹25', icon: Clock },
              { value: 'express', label: 'Express', sub: '~15 mins', fee: '₹49', icon: Bike },
            ] as const).map(({ value, label, sub, fee, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, deliveryMethod: value }))}
                className={`rounded-xl border p-3 text-left transition-all ${form.deliveryMethod === value ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}
              >
                <Icon className={`w-4 h-4 mb-1 ${form.deliveryMethod === value ? 'text-orange-600' : 'text-slate-400'}`} />
                <p className="text-xs font-bold text-slate-900">{label}</p>
                <p className="text-[10px] text-slate-500">{sub} · {fee}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Payment Method */}
        <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Payment</h2>
          <div className="flex gap-2">
            {(['upi', 'cod', 'card'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setForm((f) => ({ ...f, paymentMethod: method }))}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-bold uppercase transition-all ${form.paymentMethod === method ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600'}`}
              >
                {method === 'cod' ? 'Cash' : method.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {/* Order Summary */}
        <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Order Summary</h2>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span>{formatCurrency(subtotal, 'INR')}</span></div>
            <div className="flex justify-between"><span>Delivery fee</span><span>{formatCurrency(deliveryFee, 'INR')}</span></div>
            <div className="flex justify-between"><span>Taxes & packaging</span><span>{formatCurrency(taxes, 'INR')}</span></div>
            <div className="flex justify-between font-extrabold text-slate-900 pt-1.5 border-t border-slate-100">
              <span>Grand Total</span>
              <span className="text-orange-600">{formatCurrency(grandTotal, 'INR')}</span>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={isPlacing}
          className="w-full min-h-12 rounded-xl bg-orange-600 text-white text-sm font-extrabold shadow-md shadow-orange-600/20 hover:bg-orange-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isPlacing ? 'Placing Order…' : <><span>Place Order · {formatCurrency(grandTotal, 'INR')}</span><ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </div>
  );
}
