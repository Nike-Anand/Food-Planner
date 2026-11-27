'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Zap,
  Clock,
  CreditCard,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'
import { useCartStore, DeliveryDetails } from '@/store/cartStore'
import { formatCurrency } from '@/lib/currency'

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const createOrder = useCartStore((state) => state.createOrder)

  const [name, setName] = useState('Anand Kumar')
  const [phone, setPhone] = useState('9876543210')
  const [address, setAddress] = useState('Flat 402, Green Glen Layout, Bellandur, Bengaluru')
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('express')
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const deliveryFee = deliveryMethod === 'express' ? 49 : 25
  const taxesAndPackaging = Math.round(subtotal * 0.05) + 15
  const grandTotal = subtotal + deliveryFee + taxesAndPackaging

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
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
      const order = await createOrder(details)
      router.push(`/order-status/${order.orderId}`)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to place order. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (hasHydrated && items.length === 0) {
    return (
      <div className="space-y-4">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-3 text-base font-bold text-slate-800">Your cart is empty</h2>
          <p className="mt-1 text-xs text-slate-500">Add dishes or recipe ingredients first to checkout.</p>
          <Link
            href="/order"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-600 px-5 text-xs font-bold text-white hover:bg-orange-700"
          >
            Explore Food Menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          <ShieldCheck className="h-3.5 w-3.5" /> 100% Safe Checkout
        </span>
      </div>

      <header>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500">Confirm delivery address & payment</p>
      </header>

      <form onSubmit={handlePlaceOrder} className="space-y-4">
        {/* Delivery Address */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <MapPin className="h-4 w-4 text-orange-600" /> Delivery Address
          </h2>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Delivery Street & Landmark
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Flat, Apartment/Street, Landmark"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
        </section>

        {/* Delivery Speed */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Clock className="h-4 w-4 text-orange-600" /> Delivery Speed
          </h2>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setDeliveryMethod('express')}
              className={`p-3 rounded-xl border text-left transition-all ${
                deliveryMethod === 'express'
                  ? 'border-orange-600 bg-orange-50/60 ring-2 ring-orange-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-bold text-orange-600">
                  <Zap className="h-3.5 w-3.5" /> Express
                </span>
                <span className="text-xs font-extrabold text-slate-900">₹49</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Arrives in ~15 mins</p>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMethod('standard')}
              className={`p-3 rounded-xl border text-left transition-all ${
                deliveryMethod === 'standard'
                  ? 'border-orange-600 bg-orange-50/60 ring-2 ring-orange-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Standard</span>
                <span className="text-xs font-extrabold text-slate-900">₹25</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Arrives in ~30 mins</p>
            </button>
          </div>
        </section>

        {/* Payment Method */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <CreditCard className="h-4 w-4 text-orange-600" /> Payment Option
          </h2>

          <div className="space-y-2">
            {([
              { id: 'upi', label: 'UPI / Google Pay / PhonePe', desc: 'Instant UPI Intent', icon: Zap },
              { id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay with cash at doorstep', icon: Banknote },
              { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
            ] satisfies Array<{
              id: DeliveryDetails['paymentMethod']
              label: string
              desc: string
              icon: typeof Zap
            }>).map((method) => {
              const Icon = method.icon
              const isSelected = paymentMethod === method.id
              return (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-orange-600 bg-orange-50/40 ring-1 ring-orange-500/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{method.label}</p>
                      <p className="text-[10px] text-slate-500">{method.desc}</p>
                    </div>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-orange-600 bg-orange-600' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Bill Summary */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Bill Breakdown</h2>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Total ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
              <span>{formatCurrency(subtotal, 'INR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Partner Fee</span>
              <span>{formatCurrency(deliveryFee, 'INR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & Restaurant Packaging</span>
              <span>{formatCurrency(taxesAndPackaging, 'INR')}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
              <span>To Pay</span>
              <span className="text-orange-600">{formatCurrency(grandTotal, 'INR')}</span>
            </div>
          </div>
        </section>

        {errorMsg && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
            {errorMsg}
          </p>
        )}

        {/* Place Order CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-12 rounded-xl bg-orange-600 px-4 text-sm font-extrabold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Place Order · {formatCurrency(grandTotal, 'INR')}
            </>
          )}
        </button>
      </form>
    </div>
  )
}
