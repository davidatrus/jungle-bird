'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import SocialIconsMask from '@/components/shared/SocialIconsMask';
import ReservationModal from '@/components/shared/ReservationModal';
import { getVenueConfig, type VenueKey } from '@/lib/venueConfig';

type Social = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  snapchat?: string;
};

type Props = {
  venueKey?: VenueKey;
  social?: Social | null;
};

export default function HeroClient({
  venueKey = 'jungle_bird',
  social,
}: Props) {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const config = getVenueConfig(venueKey);
  const isProhibition = venueKey === 'prohibition';

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;

    v.muted = true;
    v.playsInline = true;

    const kick = () => v.play().catch(() => {});
    kick();

    const onVis = () => document.visibilityState === 'visible' && kick();
    const onPause = () => document.visibilityState === 'visible' && kick();
    const onLoaded = () => kick();

    document.addEventListener('visibilitychange', onVis);
    v.addEventListener('pause', onPause);
    v.addEventListener('loadeddata', onLoaded);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('loadeddata', onLoaded);
    };
  }, []);

  return (
    <section
      className={`relative flex items-center justify-center overflow-hidden ${
        isProhibition ? 'min-h-[82svh]' : 'min-h-[70svh]'
      }`}
    >
      <video
        ref={vidRef}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src={config.hero.videoSrc} type="video/mp4" />
      </video>

      <div className="hero-overlay absolute inset-0" aria-hidden="true" />

      <div
        className={`absolute inset-x-0 z-10 flex justify-center ${
          isProhibition ? 'top-6' : 'top-4'
        }`}
      >
        <SocialIconsMask
          topBar
          size={22}
          gap="gap-5"
          links={social ?? null}
          placeholders
        />
      </div>

      <div
        className={`relative z-10 mx-auto flex flex-col items-center px-6 text-center ${
          isProhibition ? 'gap-6' : 'gap-[clamp(10px,1.4vw,16px)]'
        }`}
      >
        {isProhibition && config.hero.wordmarkSrc ? (
          <>
            <Image
              src={config.hero.wordmarkSrc}
              alt={config.hero.wordmarkAlt ?? config.hero.title}
              width={2048}
              height={745}
              priority
              className="h-auto w-[min(92vw,980px)] drop-shadow-[0_10px_40px_rgba(0,0,0,0.7)]"
            />

            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 md:gap-5">
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="btn-pop btn-shadow rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold tracking-[0.14em] uppercase md:px-7"
                style={{ background: 'var(--cta)', color: 'var(--cta-text)' }}
              >
                Book Now
              </button>

              <Link
                href={config.hero.menuHref}
                className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold tracking-[0.14em] uppercase transition-colors md:px-7"
                style={{ color: 'var(--text)', background: 'rgba(0,0,0,0.18)' }}
              >
                View Menu
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-begum text-[clamp(44px,6.6vw,96px)] leading-none tracking-tight text-white [text-shadow:0_6px_30px_rgba(0,0,0,.55)]">
              {config.hero.title}
            </h1>

            <p className="font-mikado text-[clamp(16px,2.2vw,28px)] tracking-[0.14em] text-white/95 uppercase [text-shadow:0_6px_30px_rgba(0,0,0,.55)]">
              {config.hero.subtitle}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="btn-pop btn-shadow brass-border rounded-full px-5 py-3 text-sm font-semibold"
                style={{ background: 'var(--cta)', color: '#1B1612' }}
              >
                Book Now
              </button>

              <Link
                href={config.hero.menuHref}
                className="brass-border rounded-full border px-5 py-3 text-sm font-semibold"
                style={{ color: 'var(--text)' }}
              >
                View Menu
              </Link>
            </div>
          </>
        )}
      </div>

      <ReservationModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        venueKey={venueKey}
      />
    </section>
  );
}
