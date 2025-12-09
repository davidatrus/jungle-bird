import './globals.css';
import type { Metadata } from 'next';
import { begumSemiBold, mikadoBold } from './fonts';
import { Analytics } from '@vercel/analytics/react';

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BarOrPub',
  name: 'Jungle Bird Tiki Lounge',
  description:
    "Discover Jungle Bird, Calgary's tiki-cave lounge on 17th Ave. Rum-forward cocktails, fire-lit ambiance, and a tropical escape in the heart of the Beltline.",
  url: 'https://www.junglebirdtikiyyc.com/',
  image: 'https://www.junglebirdtikiyyc.com/images/og/jungle-bird-og.webp',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '725A 17 Ave SW',
    addressLocality: 'Calgary',
    addressRegion: 'AB',
    postalCode: 'T2S 0B7',
    addressCountry: 'CA',
  },
  // Hours: Sun–Thu 5pm–1am, Fri–Sat 5pm–2am, Monday closed
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '17:00',
      closes: '01:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Friday', 'Saturday'],
      opens: '17:00',
      closes: '02:00',
    },
    // Monday is closed, so we simply omit it from the schedule
  ],
};

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
