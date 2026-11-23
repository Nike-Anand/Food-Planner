'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, ChefHat, ShoppingCart, Clock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function MobileNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((state) => state.getTotalCount());
  const cartHasHydrated = useCartStore((state) => state.hasHydrated);
  const activeOrder = useCartStore((state) => state.activeOrder);
  const orders = useCartStore((state) => state.orders);

  // Flagsmith feature flag state
  const [recipeEnabled, setRecipeEnabled] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/flags')
      .then((res) => res.json())
      .then((data) => {
        if (data?.flags?.cook_yourself_enabled !== undefined) {
          setRecipeEnabled(data.flags.cook_yourself_enabled);
        }
      })
      .catch((err) => console.warn('Could not read flags:', err));
  }, []);

  const navItems = [
    {
      label: 'Order Food',
      href: '/order',
      icon: Utensils,
    },
    {
      label: 'Recipe AI',
      href: '/recipe',
      icon: ChefHat,
      badge: recipeEnabled ? 'AI' : 'OFF',
      badgeColor: recipeEnabled ? undefined : 'bg-slate-400',
    },
    {
      label: 'My Cart',
      href: '/cart',
      icon: ShoppingCart,
      count: cartCount,
      loading: !cartHasHydrated,
    },
    {
      label: 'My Orders',
      href: activeOrder ? `/order-status/${activeOrder.orderId}` : '/orders',
      icon: Clock,
      hasPulse: activeOrder && activeOrder.status !== 'delivered',
      badge: activeOrder && activeOrder.status !== 'delivered' ? 'LIVE' : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 max-w-[430px] w-full bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-4 py-2 z-40 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`relative flex min-h-12 flex-col items-center justify-center gap-1 px-2.5 py-1 transition-all ${
              isActive ? 'text-orange-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {item.loading ? (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-300 px-1 text-[10px] font-bold text-white" aria-hidden="true">
                  …
                </span>
              ) : item.count && item.count > 0 ? (
                <span className="absolute -top-1.5 -right-2.5 bg-orange-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {item.count}
                </span>
              ) : null}
              {item.badge && (
                <span
                  className={`absolute -top-1 -right-3.5 text-white text-[8px] font-black px-1 rounded-full shadow-xs ${
                    item.badgeColor || (item.badge === 'LIVE' ? 'bg-emerald-600 animate-pulse' : 'bg-gradient-to-r from-amber-500 to-orange-500')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-orange-600 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
