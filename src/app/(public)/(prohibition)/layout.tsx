import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Cormorant_Garamond } from 'next/font/google';

const prohibitionDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-prohibition-display',
});

export const metadata: Metadata = {
  title: {
    default: 'Prohibition Lounge Calgary | Speakeasy Cocktail Bar',
    template: '%s | Prohibition Lounge Calgary',
  },
  description:
    'Step into Prohibition Lounge in Calgary for a moody speakeasy experience, vintage ambiance, expertly crafted cocktails, and late-night lounge energy.',
  alternates: {
    canonical: '/prohibition',
  },
  manifest: '/images/prohibition/site.webmanifest',
  appleWebApp: {
    title: 'Prohibition',
  },
  icons: {
    icon: [
      { url: '/images/prohibition/favicon.ico', type: 'image/x-icon' },
      { url: '/images/prohibition/favicon.svg', type: 'image/svg+xml' },
      {
        url: '/images/prohibition/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
    ],
    apple: [{ url: '/images/prohibition/apple-touch-icon.png' }],
  },
  openGraph: {
    type: 'website',
    url: 'https://www.junglebirdtikiyyc.com/prohibition',
    title: 'Prohibition Lounge Calgary | Speakeasy Cocktail Bar',
    description:
      'Step into Prohibition Lounge in Calgary for a moody speakeasy experience, vintage ambiance, expertly crafted cocktails, and late-night lounge energy.',
    siteName: 'Prohibition Lounge Calgary',
    images: [
      {
        url: '/images/og/prohibition-og.webp',
        width: 1200,
        height: 630,
        alt: 'Prohibition Lounge Calgary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prohibition Lounge Calgary | Speakeasy Cocktail Bar',
    description:
      'Step into Prohibition Lounge in Calgary for a moody speakeasy experience, vintage ambiance, expertly crafted cocktails, and late-night lounge energy.',
    images: ['/images/og/prohibition-og.webp'],
  },
};

export default function ProhibitionRouteGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div data-venue="prohibition" className={prohibitionDisplay.variable}>
      {children}
    </div>
  );
}
