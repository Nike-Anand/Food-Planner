'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function MobileHeader() {
  const pathname = usePathname();
  const totalItems = useCartStore((state) => {
    const source =
      pathname === '/order'
        ? 'food_menu'
        : pathname === '/recipe'
          ? 'recipe_ingredient'
          : undefined;
    return source
      ? state.items
          .filter((item) => item.source === source)
          .reduce((count, item) => count + item.quantity, 0)
      : state.getTotalCount();
  });
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const cartHref =
    pathname === '/order'
      ? '/cart?source=food_menu'
      : pathname === '/recipe'
        ? '/cart?source=recipe_ingredient'
        : '/cart';
  const hideCartShortcut =
    pathname === '/experiment' ||
    pathname === '/cart' ||
    pathname === '/checkout' ||
    pathname.startsWith('/order-status/');

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <Link href="/" className="group flex min-h-12 items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
          <UtensilsCrossed className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1">
            FoodHub <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">AI</span>
          </span>
        </div>
      </Link>

      {!hideCartShortcut && (
        <div className="flex items-center gap-2">
          <Link
            href={cartHref}
            className="relative flex h-12 w-12 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 active:scale-95"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {!hasHydrated ? (
              <span className="absolute top-1 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-300 px-1 text-[10px] font-bold text-white" aria-hidden="true">
                …
              </span>
            ) : totalItems > 0 ? (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-orange-600 rounded-full px-1 shadow-sm animate-pulse">
                {totalItems}
              </span>
            ) : null}
          </Link>
        </div>
      )}
    </header>
  );
}
