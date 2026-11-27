'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  MapPin,
  ChefHat,
  Bike,
  Home,
} from 'lucide-react'
import { useCartStore, ActiveOrder } from '@/store/cartStore'
import { formatCurrency } from '@/lib/currency'

const STATUS_STEP: Record<ActiveOrder['status'], number> = {
  placed: 0,
  preparing: 1,
  on_the_way: 2,
  delivered: 3,
}

export default function OrderStatusPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = params.orderId
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const order = useCartStore(
    (state) =>
      state.orders.find((storedOrder) => storedOrder.orderId === orderId) ??
      (state.activeOrder?.orderId === orderId ? state.activeOrder : null)
  )
  const updateOrderStatus = useCartStore((state) => state.updateOrderStatus)
  const currentStep = order ? STATUS_STEP[order.status] : 0
  const minutesLeft = order
    ? currentStep >= 3
      ? 0
      : currentStep >= 2
        ? 10
        : order.estimatedDeliveryMinutes || 20
    : 0
  const orderPlacedAt = order?.placedAt
  const isFoodOrder = order?.source === 'food_menu'
  const isRecipeOrder = order?.source === 'recipe_ingredient'
  const orderLabel = isFoodOrder
    ? 'Food order'
    : isRecipeOrder
      ? 'Recipe ingredient order'
      : 'Combined legacy order'
  const returnHref = isRecipeOrder ? '/recipe' : '/order'

  useEffect(() => {
    if (!hasHydrated || !orderPlacedAt || currentStep >= 3) {
      return
    }

    const elapsed = Math.max(0, Date.now() - new Date(orderPlacedAt).getTime())
    const stages: Array<{
      step: number
      elapsedAt: number
      status: ActiveOrder['status']
    }> = [
      { step: 1, elapsedAt: 4000, status: 'preparing' },
      { step: 2, elapsedAt: 10000, status: 'on_the_way' },
      { step: 3, elapsedAt: 18000, status: 'delivered' },
    ]
    const timers = stages
      .filter((stage) => stage.step > currentStep)
      .map((stage) =>
        window.setTimeout(
          () => updateOrderStatus(orderId, stage.status),
          Math.max(0, stage.elapsedAt - elapsed)
        )
      )

    return () => timers.forEach(window.clearTimeout)
  }, [hasHydrated, orderId, orderPlacedAt, currentStep, updateOrderStatus])

  if (!hasHydrated || !order) {
    return (
      <div className="space-y-4 py-8 text-center">
        <h1 className="text-base font-bold text-slate-800">
          {!hasHydrated ? 'Loading your order…' : `Order ${orderId} was not found`}
        </h1>
        <p className="text-xs text-slate-500">
          {!hasHydrated
            ? 'Restoring saved order details.'
            : 'Check the order ID or browse the food menu.'}
        </p>
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
    { title: 'Order Placed', desc: isRecipeOrder ? 'Ingredient order received' : 'Received & acknowledged by kitchen', icon: CheckCircle2 },
    { title: isRecipeOrder ? 'Packing Ingredients' : 'Kitchen Preparing', desc: isRecipeOrder ? 'Packing your recipe ingredients' : 'Preparing your food order', icon: ChefHat },
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
            {currentStep === 3
              ? `${orderLabel} delivered!`
              : `${orderLabel} is on its way`}
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

      {/* Order Items Breakdown */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {orderLabel} Summary
          </h2>
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

        <div className="space-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
          <div className="flex justify-between">
            <span>{isRecipeOrder ? 'Ingredient subtotal' : 'Items subtotal'}</span>
            <span>{formatCurrency(order.subtotal, 'INR')}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee</span>
            <span>{formatCurrency(order.deliveryFee, 'INR')}</span>
          </div>
          {order.taxesAndPackaging > 0 && (
            <div className="flex justify-between">
              <span>
                {isFoodOrder
                  ? 'Food tax & restaurant packaging'
                  : 'Taxes & packaging (legacy order)'}
              </span>
              <span>{formatCurrency(order.taxesAndPackaging, 'INR')}</span>
            </div>
          )}
        </div>

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
          href={returnHref}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
        >
          {isRecipeOrder ? 'Return to Recipe Maker' : 'Return to Food Menu'}
        </Link>
      </div>
    </div>
  )
}
