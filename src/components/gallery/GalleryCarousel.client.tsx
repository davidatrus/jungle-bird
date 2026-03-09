'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { urlFor } from '@/sanity/image';

type SanityImage =
  | string
  | { _ref?: string | null }
  | { asset?: { _ref?: string | null; _id?: string | null } | null }
  | null
  | undefined;

type Item = { caption?: string | null; image?: SanityImage };

const STEP = 1;
const CARD_GAP = 16;

function getSanityImageSource(img: SanityImage) {
  if (!img) return null;

  if (typeof img === 'string') return img;

  if (typeof img === 'object' && '_ref' in img && img._ref) return img;

  if (
    typeof img === 'object' &&
    'asset' in img &&
    img.asset &&
    (img.asset._ref || img.asset._id)
  ) {
    return img;
  }

  return null;
}

export default function GalleryCarouselClient({
  items,
  venueKey = 'jungle_bird',
}: {
  items: Item[];
  venueKey?: 'jungle_bird' | 'prohibition';
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const isProhibition = venueKey === 'prohibition';

  const safeItems = useMemo(() => {
    return (items || []).filter((it) => !!getSanityImageSource(it?.image));
  }, [items]);

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

  if (!safeItems.length) {
    return (
      <div
        className={`rounded-2xl p-4 text-sm ${
          isProhibition
            ? 'border'
            : 'border border-white/10 bg-white/5 text-white/70'
        }`}
        style={
          isProhibition
            ? {
                borderColor: 'rgba(214,178,84,0.26)',
                background:
                  'linear-gradient(180deg, rgba(4,10,24,0.96) 0%, rgba(2,6,16,0.98) 100%)',
                color: 'var(--text)',
              }
            : undefined
        }
      >
        No gallery photos yet.
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="scrollbar-none snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="grid auto-cols-[minmax(280px,1fr)] grid-flow-col gap-4 md:auto-cols-[minmax(340px,1fr)] lg:auto-cols-[minmax(360px,1fr)]">
          {safeItems.map((g, i) => {
            const srcObj = getSanityImageSource(g.image);
            if (!srcObj) return null;

            let src = '';
            try {
              src = urlFor(srcObj).width(1200).height(800).fit('crop').url();
            } catch {
              return null;
            }

            const alt =
              (g.caption ?? '').trim() ||
              (isProhibition
                ? 'Photo from Prohibition'
                : 'Photo from Jungle Bird');

            return (
              <figure
                key={i}
                data-card
                className="brass-border snap-start overflow-hidden rounded-2xl ring-1 ring-[var(--line)]"
                style={
                  isProhibition
                    ? {
                        background:
                          'linear-gradient(180deg, rgba(4,10,24,0.95) 0%, rgba(2,6,16,0.98) 100%)',
                      }
                    : undefined
                }
              >
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

      {canPrev && (
        <button
          aria-label="Previous"
          onClick={() => scrollByCards(-1)}
          className="brass-border absolute top-1/2 left-0 -translate-y-1/2 rounded-full border px-3 py-2 opacity-70 hover:opacity-100"
          style={
            isProhibition
              ? {
                  background: 'rgba(2, 6, 16, 0.84)',
                  color: 'var(--text)',
                }
              : {
                  background: 'rgba(27,22,18,.6)',
                  color: 'var(--text)',
                }
          }
        >
          ‹
        </button>
      )}

      {canNext && (
        <button
          aria-label="Next"
          onClick={() => scrollByCards(1)}
          className="brass-border absolute top-1/2 right-0 -translate-y-1/2 rounded-full border px-3 py-2 opacity-70 hover:opacity-100"
          style={
            isProhibition
              ? {
                  background: 'rgba(2, 6, 16, 0.84)',
                  color: 'var(--text)',
                }
              : {
                  background: 'rgba(27,22,18,.6)',
                  color: 'var(--text)',
                }
          }
        >
          ›
        </button>
      )}
    </div>
  );
}
