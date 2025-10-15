'use client';

import { useEffect, useRef, useState } from 'react';
import { urlFor } from '@/sanity/image';

type SanityImage =
  | string
  | { _ref?: string }
  | { asset?: { _ref?: string; _id?: string } };

type Item = { caption?: string; image: SanityImage };

const STEP = 1;
const CARD_GAP = 16; // must match gap-4

export default function GalleryCarouselClient({ items }: { items: Item[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = () => {
    const el = scroller.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const EPS = 2;
    setCanPrev(scrollLeft > EPS);
    setCanNext(scrollLeft < scrollWidth - clientWidth - EPS);
  };

  useEffect(() => {
    updateArrows();
    const el = scroller.current;
    if (!el) return;

    const onScroll = () => updateArrows();
    const onResize = () => updateArrows();

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('[data-card]');
    const width = firstCard ? firstCard.getBoundingClientRect().width : 320;
    const delta = dir * (width + CARD_GAP) * STEP;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (!items?.length) return null;

  return (
    <div className="relative">
      {/* Track */}
      <div
        ref={scroller}
        className="scrollbar-none snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="grid auto-cols-[minmax(280px,1fr)] grid-flow-col gap-4 md:auto-cols-[minmax(340px,1fr)] lg:auto-cols-[minmax(360px,1fr)]">
          {items.map((g, i) => {
            const src = urlFor(g.image)
              .width(1200)
              .height(800)
              .fit('crop')
              .url();
            const alt = g.caption?.trim() || 'Photo from Jungle Bird';
            return (
              <figure
                key={i}
                data-card
                className="brass-border snap-start overflow-hidden rounded-2xl ring-1 ring-[var(--line)]"
              >
                {/* Fixed height like old site */}
                <img
                  src={src}
                  alt={alt}
                  className="h-56 w-full object-cover sepia md:h-64"
                  loading={i < 3 ? 'eager' : 'lazy'}
                />
              </figure>
            );
          })}
        </div>
      </div>

      {/* Arrows (subtle) */}
      {canPrev && (
        <button
          aria-label="Previous"
          onClick={() => scrollByCards(-1)}
          className="brass-border absolute top-1/2 left-0 -translate-y-1/2 rounded-full border px-3 py-2 opacity-70 hover:opacity-100"
          style={{ background: 'rgba(27,22,18,.6)', color: 'var(--text)' }}
        >
          ‹
        </button>
      )}
      {canNext && (
        <button
          aria-label="Next"
          onClick={() => scrollByCards(1)}
          className="brass-border absolute top-1/2 right-0 -translate-y-1/2 rounded-full border px-3 py-2 opacity-70 hover:opacity-100"
          style={{ background: 'rgba(27,22,18,.6)', color: 'var(--text)' }}
        >
          ›
        </button>
      )}
    </div>
  );
}
