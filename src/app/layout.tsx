import './globals.css';
import type { Metadata } from 'next';
import { begumSemiBold, mikadoBold } from './fonts';
import { Analytics } from '@vercel/analytics/react';

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BarOrPub',
  '@id': 'https://www.junglebirdtikiyyc.com/#localbusiness',
  name: 'Jungle Bird Tiki Lounge',
  url: 'https://www.junglebirdtikiyyc.com',
  telephone: '+1-825-982-8454',
  priceRange: '$$',
  image: 'https://www.junglebirdtikiyyc.com/images/og/jungle-bird-og.webp',
  servesCuisine: ['Tiki', 'Mexican', 'Bar Food'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '725a 17 Ave SW',
    addressLocality: 'Calgary',
    addressRegion: 'AB',
    postalCode: 'T2S 0B6',
    addressCountry: 'CA',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Sunday'],
      opens: '17:00',
      closes: '01:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Friday', 'Saturday'],
      opens: '17:00',
      closes: '02:00',
    },
  ],
  sameAs: [
    'https://www.instagram.com/junglebirdtikiyyc',
    'https://share.google/3PevWedo437AFUepo',
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.junglebirdtikiyyc.com'),
  title: {
    default: 'Jungle Bird Tiki Lounge Calgary | Cocktails & Rum on 17 Ave',
    template: '%s | Jungle Bird Tiki Lounge Calgary',
  },
  description:
    "Discover Jungle Bird, Calgary's Tiki-Cave lounge on 17th Ave. Rum forward cocktails, fire lit ambiance, and a tropical escape in the heart of the Beltline.",
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'Jungle Bird',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/icon1.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png' }],
  },
  openGraph: {
    type: 'website',
    url: 'https://www.junglebirdtikiyyc.com/',
    title: 'Jungle Bird Tiki Lounge Calgary | Cocktails & Rum on 17th Ave',
    description:
      "Discover Jungle Bird, Calgary's tiki-cave lounge on 17th Ave. Rum-forward cocktails, fire-lit ambiance, and a tropical escape in the heart of the Beltline.",
    siteName: 'Jungle Bird Tiki Lounge YYC',
    images: [
      {
        url: '/images/og/jungle-bird-og.webp',
        width: 1200,
        height: 630,
        alt: 'Jungle Bird Tiki Lounge YYC — cocktails & rum on 17th Ave in Calgary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jungle Bird Tiki Lounge Calgary | Cocktails & Rum on 17th Ave',
    description:
      "Discover Jungle Bird, Calgary's tiki-cave lounge on 17th Ave. Rum-forward cocktails, fire-lit ambiance, and a tropical escape in the heart of the Beltline.",
    images: ['/images/og/jungle-bird-og.webp'],
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
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
