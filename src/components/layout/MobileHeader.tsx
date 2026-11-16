'use client';

import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, ShoppingBag, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function MobileHeader() {
  const totalItems = useCartStore((state) => state.getTotalCount());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
          <UtensilsCrossed className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1">
            FoodHub <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">AI</span>
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/cart"
          className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
          aria-label="View Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-orange-600 rounded-full px-1 shadow-sm animate-pulse">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
