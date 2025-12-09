import './globals.css';
import type { Metadata } from 'next';
import { begumSemiBold, mikadoBold } from './fonts';

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.junglebirdtikiyyc.com'),
  title: 'Jungle Bird Tiki Lounge Calgary | Cocktails & Rum on 17 Ave',
  description:
    "Discover Jungle Bird, Calgary's Tiki-Cave lounge on 17th Ave. Rum forward cocktails, fire lit ambiance, and a tropical escape in the heart of the Beltline.",
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    apple: '/images/logo/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${begumSemiBold.variable} ${mikadoBold.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
