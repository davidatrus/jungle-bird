import './globals.css';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Jungle Bird',
  description: 'Tiki-Cave & Lounge. Welcome to the Jungle',
  icons: {
    icon: '/images/logo/icon.png', // browser tab
    shortcut: '/images/logo/icon.png',
    apple: '/images/logo/icon.png', // iOS home screen
  },
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
