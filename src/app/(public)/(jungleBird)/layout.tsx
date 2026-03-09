import type { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';

export default function JungleBirdLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar venueKey="jungle_bird" />
      {children}
    </>
  );
}
