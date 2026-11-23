'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  Clock,
  MapPin,
  ChefHat,
  Bike,
  Home,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { useCartStore, ActiveOrder } from '@/store/cartStore'
import { formatCurrency } from '@/lib/currency'

export default function OrderStatusPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.orderId as string
  const getOrderById = useCartStore((state) => state.getOrderById)
  const activeOrder = useCartStore((state) => state.activeOrder)
  const updateOrderStatus = useCartStore((state) => state.updateOrderStatus)

  const [order, setOrder] = useState<ActiveOrder | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [minutesLeft, setMinutesLeft] = useState<number>(20)

  useEffect(() => {
    const found = getOrderById(orderId) || activeOrder
    if (found) {
      setOrder(found)
      setMinutesLeft(found.estimatedDeliveryMinutes || 20)
    }
  }, [orderId, getOrderById, activeOrder])

  // Simulate progress across stages for a demo
  useEffect(() => {
    if (!order) return

    const t1 = setTimeout(() => {
      setCurrentStep(1)
      updateOrderStatus(order.orderId, 'preparing')
    }, 4000)

    const t2 = setTimeout(() => {
      setCurrentStep(2)
      updateOrderStatus(order.orderId, 'on_the_way')
      setMinutesLeft(10)
    }, 10000)

    const t3 = setTimeout(() => {
      setCurrentStep(3)
      updateOrderStatus(order.orderId, 'delivered')
      setMinutesLeft(0)
    }, 18000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [order, updateOrderStatus])

  if (!order) {
    return (
      <div className="space-y-4 py-8 text-center">
        <h1 className="text-base font-bold text-slate-800">Looking up order {orderId}...</h1>
        <p className="text-xs text-slate-500">Please wait or browse the food menu.</p>
        <Link
          href="/order"
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-600 px-5 text-xs font-bold text-white"
        >
          Explore Food
        </Link>
      </div>
    )
  }

  const steps = [
    { title: 'Order Placed', desc: 'Received & acknowledged by kitchen', icon: CheckCircle2 },
    { title: 'Kitchen Preparing', desc: 'Freshly cooking your meal / ingredients', icon: ChefHat },
    { title: 'On The Way', desc: 'Delivery partner heading to your address', icon: Bike },
    { title: 'Delivered', desc: 'Arrived at your doorstep. Bon Appétit!', icon: Home },
  ]

  return (
    <div className="space-y-4 pb-4">
      {/* Success Banner */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
            <CheckCircle2 className="h-3 w-3" /> Live Tracking
          </span>
          <span className="text-xs font-medium text-emerald-100">
            ID: <span className="font-mono font-bold text-white">{order.orderId}</span>
          </span>
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-black tracking-tight">
            {currentStep === 3 ? 'Order Delivered! 🎉' : 'On its way to you'}
          </h1>
          <p className="mt-0.5 text-xs text-emerald-50">
            {currentStep === 3
              ? 'Your package has arrived safely.'
              : `Estimated delivery in ~${minutesLeft} mins`}
          </p>
        </div>
      </section>

      {/* Progress Timeline */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Delivery Status
        </h2>

        <div className="space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isDone = idx <= currentStep
            const isCurrent = idx === currentStep

            return (
              <div key={step.title} className="flex items-start gap-3 relative">
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 bottom-[-16px] w-0.5 ${
                      idx < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}

                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  } ${isCurrent && currentStep < 3 ? 'ring-4 ring-emerald-500/20 animate-pulse' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className={`text-xs font-bold ${
                      isDone ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Hackathon Bridge CTA: Cook while you wait! */}
      <section className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-xs">
        <div className="flex items-start gap-2.5">
          <div className="rounded-xl bg-amber-500 p-2 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Waiting for delivery?</h3>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Check out our AI Chef Recipe Maker to discover cooking hacks and recipe guides while your order arrives!
            </p>
            <Link
              href="/recipe"
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-900"
            >
              Explore Recipe Maker <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Order Items Breakdown */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Summary</h2>
          <span className="text-xs font-bold text-slate-800">
            {formatCurrency(order.grandTotal, 'INR')}
          </span>
        </div>

        <ul className="divide-y divide-slate-100">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between py-2 text-xs">
              <span className="text-slate-700">
                {item.quantity}x {item.name}
              </span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(item.price * item.quantity, 'INR')}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{order.deliveryDetails.address}</span>
          </div>
          <p className="pl-5 text-slate-400">
            Contact: {order.deliveryDetails.name} ({order.deliveryDetails.phone})
          </p>
        </div>
      </section>

      <div className="pt-2 text-center">
        <Link
          href="/order"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
        >
          Return to Food Menu
        </Link>
      </div>
    </div>
  )
}
