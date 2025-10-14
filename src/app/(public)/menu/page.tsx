'use client';

import Image from 'next/image';
import { useMemo } from 'react';

const MENU_PAGES = [
  '/images/menu/1.png',
  '/images/menu/2.png',
  '/images/menu/3.png',
  '/images/menu/4.png',
  '/images/menu/5.png',
  '/images/menu/6.png',
  '/images/menu/7.png',
  '/images/menu/8.png',
  '/images/menu/9.png',
];

export default function MenuPage() {
  const pages = useMemo(() => MENU_PAGES, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-6 text-center">
        <h1 className="section-title text-3xl md:text-4xl">Menu</h1>
        <p className="mt-2 text-sm opacity-80">Tap any page to zoom/open.</p>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => window.print()}
            className="btn-pop brass-border rounded-full px-4 py-2 text-xs font-semibold"
            style={{
              background: 'var(--cta)',
              color: '#1B1612',
              border: '1px solid var(--line)',
            }}
          >
            Print / Save
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {pages.map((src, i) => (
          <a
            key={src}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            aria-label={`Open menu page ${i + 1} in new tab`}
          >
            <div className="brass-border overflow-hidden rounded-2xl ring-1">
              <Image
                src={src}
                alt={`Menu page ${i + 1}`}
                width={1600}
                height={2200}
                className="h-auto w-full object-contain"
                priority={i === 0}
              />
            </div>
          </a>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          header,
          nav,
          footer {
            display: none !important;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          .brass-border {
            border-color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
}
