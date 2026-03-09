import type { ReactNode } from 'react';
import { Cormorant_Garamond } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';

const prohibitionDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-prohibition-display',
});

export default function ProhibitionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div data-venue="prohibition" className={prohibitionDisplay.variable}>
      <Navbar venueKey="prohibition" />
      {children}
    </div>
  );
}
