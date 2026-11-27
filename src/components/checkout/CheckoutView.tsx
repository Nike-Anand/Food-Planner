'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
  Zap,
} from 'lucide-react'
import { calculateOrderTotals, useCartStore } from '@/store/cartStore'
import type { DeliveryDetails } from '@/store/cartStore'
import type { CartItemSource } from '@/types/shared'
import { formatCurrency } from '@/lib/currency'

interface CheckoutViewProps {
  source: CartItemSource
}

export function CheckoutView({ source }: CheckoutViewProps) {
  const router = useRouter()
  const cartItems = useCartStore((state) => state.items)
  const items = cartItems.filter((item) => item.source === source)
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const subtotal = useCartStore((state) => state.getSubtotal(source))
  const createOrder = useCartStore((state) => state.createOrder)
  const [name, setName] = useState('Anand Kumar')
  const [phone, setPhone] = useState('9876543210')
  const [address, setAddress] = useState(
    'Flat 402, Green Glen Layout, Bellandur, Bengaluru'
  )
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryDetails['deliveryMethod']>('express')
  const [paymentMethod, setPaymentMethod] =
    useState<DeliveryDetails['paymentMethod']>('upi')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const totals = calculateOrderTotals(subtotal, source, deliveryMethod)
  const isFoodOrder = source === 'food_menu'
  const orderLabel = isFoodOrder ? 'Food order' : 'Recipe ingredient order'
  const cartHref = `/cart?source=${source}`

  const handlePlaceOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Please complete all contact and address fields.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const details: DeliveryDetails = {
        name,
        phone,
        address,
        deliveryMethod,
        paymentMethod,
      }
      const order = await createOrder(details, source)
      router.push(`/order-status/${order.orderId}?source=${source}`)
    } catch (error) {
      console.error(`Could not place the ${orderLabel.toLowerCase()}.`, error)
      setErrorMsg('Could not place this order. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (!hasHydrated) {
    return (
      <div role="status" className="py-12 text-center text-sm text-slate-500">
        Restoring your cart…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <Link
          href={cartHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-3 text-base font-bold text-slate-800">
            No {isFoodOrder ? 'food menu items' : 'recipe ingredients'} to check out
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            This checkout only includes {isFoodOrder ? 'food menu items' : 'recipe ingredients'}.
          </p>
          <Link
            href={cartHref}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-600 px-5 text-xs font-bold text-white hover:bg-orange-700"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href={cartHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" /> Demo Checkout
        </span>
      </div>

      <header>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          {isFoodOrder ? 'Food Order Checkout' : 'Recipe Ingredient Checkout'}
        </h1>
        <p className="text-xs text-slate-500">
          This checkout includes only {isFoodOrder ? 'food menu items' : 'recipe ingredients'}.
        </p>
      </header>

      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <MapPin className="h-4 w-4 text-orange-600" /> Delivery Address
          </h2>
          <label className="block text-[11px] font-semibold text-slate-600">
            Full Name
            <span className="relative mt-1 block">
              <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </span>
          </label>
          <label className="block text-[11px] font-semibold text-slate-600">
            Phone Number
            <span className="relative mt-1 block">
              <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </span>
          </label>
          <label className="block text-[11px] font-semibold text-slate-600">
            Delivery Street &amp; Landmark
            <textarea
              required
              rows={2}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </label>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Clock className="h-4 w-4 text-orange-600" /> Delivery Speed
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {([
              { id: 'express', label: 'Express', fee: 49, time: '~15 mins' },
              { id: 'standard', label: 'Standard', fee: 25, time: '~30 mins' },
            ] as const).map((method) => (
              <button
                key={method.id}
                type="button"
                aria-pressed={deliveryMethod === method.id}
                onClick={() => setDeliveryMethod(method.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  deliveryMethod === method.id
                    ? 'border-orange-600 bg-orange-50/60 ring-2 ring-orange-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center justify-between text-xs font-bold text-slate-900">
                  {method.id === 'express' && <Zap className="h-3.5 w-3.5 text-orange-600" />}
                  {method.label}
                  {formatCurrency(method.fee, 'INR')}
                </span>
                <span className="mt-1 block text-[11px] text-slate-500">
                  Arrives in {method.time}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Payment Option
          </h2>
          {([
            { id: 'upi', label: 'UPI / Google Pay / PhonePe', icon: Zap },
            { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
            { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
          ] as const).map((method) => {
            const Icon = method.icon
            return (
              <button
                key={method.id}
                type="button"
                aria-pressed={paymentMethod === method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex min-h-11 w-full items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold ${
                  paymentMethod === method.id
                    ? 'border-orange-600 bg-orange-50/40 text-orange-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {method.label}
              </button>
            )
          })}
        </section>

        <section className="space-y-2.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {orderLabel} Summary
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity, 'INR')}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t border-slate-100 pt-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>{isFoodOrder ? 'Food items subtotal' : 'Ingredient subtotal'}</span>
              <span>{formatCurrency(subtotal, 'INR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery fee</span>
              <span>{formatCurrency(totals.deliveryFee, 'INR')}</span>
            </div>
            {isFoodOrder && (
              <div className="flex justify-between">
                <span>Food tax &amp; restaurant packaging</span>
                <span>{formatCurrency(totals.taxesAndPackaging, 'INR')}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-extrabold text-slate-900">
              <span>{isFoodOrder ? 'Food order total' : 'Ingredient order total'}</span>
              <span className="text-orange-600">{formatCurrency(totals.grandTotal, 'INR')}</span>
            </div>
          </div>
        </section>

        {errorMsg && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-600">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-extrabold text-white shadow-md shadow-orange-600/20 transition-all hover:bg-orange-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Processing…' : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Place {isFoodOrder ? 'Food' : 'Ingredient'} Order · {formatCurrency(totals.grandTotal, 'INR')}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
