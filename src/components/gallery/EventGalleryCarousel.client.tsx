'use client';

import { useEffect, useRef, useState } from 'react';
import { urlFor } from '@/sanity/image';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type GalleryItem = {
  caption?: string;
  image: SanityImageSource;
};

const STEP = 1;
const CARD_GAP = 16; // must match gap-4

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getImageSource(img: SanityImageSource): SanityImageSource | null {
  if (!img) return null;

  // string ref
  if (typeof img === 'string') return img;

  // handle {_ref: "..."}
  if (isRecord(img) && typeof img._ref === 'string' && img._ref) {
    return img;
  }

  // handle {asset: {_ref}} or {asset: {_id}}
  if (isRecord(img) && isRecord(img.asset)) {
    const asset = img.asset;
    const ref = asset._ref;
    const id = asset._id;

    if ((typeof ref === 'string' && ref) || (typeof id === 'string' && id)) {
      return img;
    }
  }

  return null;
}

export default function EventGalleryCarouselClient({
  items,
}: {
  items: GalleryItem[];
}) {
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
    const width = firstCard ? firstCard.getBoundingClientRect().width : 260;
    const delta = dir * (width + CARD_GAP) * STEP;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const safeItems = (items || []).filter((g) => getImageSource(g.image));
  if (!safeItems.length) return null;

  return (
    <div className="relative min-w-0">
      <div
        ref={scroller}
        className="scrollbar-none w-full max-w-full min-w-0 snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="grid w-max auto-cols-[minmax(220px,1fr)] grid-flow-col gap-4 md:auto-cols-[minmax(260px,1fr)] lg:auto-cols-[minmax(280px,1fr)]">
          {safeItems.map((g, i) => {
            const imgSource = getImageSource(g.image);
            if (!imgSource) return null;

            const src = urlFor(imgSource)
              .width(1200)
              .height(800)
              .fit('crop')
              .url();
            const alt = (g.caption || '').trim() || 'Photo from Jungle Bird';

            return (
              <figure
                key={i}
                data-card
                className="brass-border snap-start overflow-hidden rounded-2xl ring-1 ring-[var(--line)]"
              >
                <img
                  src={src}
                  alt={alt}
                  className="h-32 w-full object-cover sepia md:h-36"
                  loading={i < 3 ? 'eager' : 'lazy'}
                />
              </figure>
            );
          })}
        </div>
      </div>

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
