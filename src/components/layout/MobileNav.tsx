'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, ChefHat, ShoppingCart, Compass } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function MobileNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((state) => state.getTotalCount());

  const navItems = [
    {
      label: 'Order Food',
      href: '/order',
      icon: Utensils,
      color: 'hover:text-orange-600',
    },
    {
      label: 'Recipe AI',
      href: '/recipe',
      icon: ChefHat,
      color: 'hover:text-amber-600',
      badge: 'AI',
    },
    {
      label: 'My Cart',
      href: '/cart',
      icon: ShoppingCart,
      color: 'hover:text-emerald-600',
      count: cartCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 max-w-[430px] w-full bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-6 py-2.5 z-40 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 relative px-3 py-1 transition-all ${
              isActive ? 'text-orange-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {item.count && item.count > 0 ? (
                <span className="absolute -top-1.5 -right-2.5 bg-orange-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {item.count}
                </span>
              ) : null}
              {item.badge && (
                <span className="absolute -top-1 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-extrabold px-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight">{item.label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-orange-600 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
