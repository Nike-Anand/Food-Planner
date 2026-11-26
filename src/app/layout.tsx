import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { MobileShell } from '@/components/layout/MobileShell';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Food Planner',
  description: 'Order food or cook it yourself with AI-powered recipes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}
