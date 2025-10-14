'use client';
import { useRef } from 'react';

const IMAGES = [
  '/images/gallery/gallery-1.jpg',
  '/images/gallery/gallery-2.jpg',
  '/images/gallery/gallery-3.jpg',
  '/images/gallery/gallery-4.jpg',
  '/images/gallery/gallery-5.jpg',
  '/images/gallery/gallery-6.jpg',
  '/images/gallery/gallery-7.jpg',
  '/images/gallery/gallery-8.jpg',
];

const STEP = 1; // change to 2 to move two at a time
const CARD_GAP = 16; // must match the gap in the grid below

export default function Gallery() {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('[data-card]');
    const width = firstCard ? firstCard.getBoundingClientRect().width : 320;
    const delta = dir * (width + CARD_GAP) * STEP;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="mb-6 text-center text-3xl md:text-4xl">Gallery</h3>

        <div className="relative">
          {/* Arrows */}
          <button
            aria-label="Previous"
            onClick={() => scrollByCards(-1)}
            className="brass-border absolute top-1/2 left-0 -translate-y-1/2 rounded-full border px-3 py-2 opacity-70 hover:opacity-100"
            style={{ background: 'rgba(27,22,18,.6)', color: 'var(--text)' }}
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={() => scrollByCards(1)}
            className="brass-border absolute top-1/2 right-0 -translate-y-1/2 rounded-full border px-3 py-2 opacity-70 hover:opacity-100"
            style={{ background: 'rgba(27,22,18,.6)', color: 'var(--text)' }}
          >
            ›
          </button>

          {/* Scroller */}
          <div
            ref={scroller}
            className="scrollbar-none snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2"
          >
            <div className="grid auto-cols-[minmax(280px,1fr)] grid-flow-col gap-4 md:auto-cols-[minmax(360px,1fr)]">
              {IMAGES.map((src) => (
                <div
                  key={src}
                  data-card
                  className="snap-start overflow-hidden rounded-2xl ring-1 ring-[var(--ring)]"
                >
                  <img
                    src={src}
                    alt=""
                    className="h-56 w-full object-cover sepia md:h-64"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
