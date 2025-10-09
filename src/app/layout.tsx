import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jungle Bird',
  description: 'Vintage Rum Bar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
