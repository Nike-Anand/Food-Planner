'use client';

import React from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileNav } from './MobileNav';

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex justify-center text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      {/* Mobile device frame: locked to 430px (iPhone 15 Pro max style) */}
      <div className="w-full max-w-[430px] min-h-screen bg-slate-50 flex flex-col relative shadow-2xl border-x border-slate-200">
        <MobileHeader />
        
        {/* Scrollable screen content area */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
          {children}
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
