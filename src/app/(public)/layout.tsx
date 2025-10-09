import type { ReactNode } from 'react';
import '@/styles/theme.css';
import '../globals.css';
import { Source_Sans_3, Prata } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';

const ui = Source_Sans_3({ subsets: ['latin'], variable: '--font-ui' });
const display = Prata({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${ui.variable} ${display.variable}`}
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <Navbar />
      {children}
    </div>
  );
}
