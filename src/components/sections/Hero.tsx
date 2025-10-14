'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import SocialIconsMask from '@/components/shared/SocialIconsMask';
import { OPENTABLE_URL } from '@/lib/constants';

export default function Hero() {
  const vidRef = useRef<HTMLVideoElement>(null);

  // Keep the background video playing whenever the tab is visible
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;

    // ensure correct flags for mobile Safari
    v.muted = true;

    v.playsInline = true;

    const kick = () => v.play().catch(() => {});

    kick(); // try on mount

    const onVis = () => {
      if (document.visibilityState === 'visible') kick();
    };
    const onPause = () => {
      if (document.visibilityState === 'visible') kick();
    };
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
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        minHeight: '76vh',
        background: "url('/images/misc/hero.jpg') center/cover no-repeat",
      }}
    >
      {/* Background video */}
      <video
        ref={vidRef}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/misc/hero.jpg"
        aria-hidden="true"
      >
        <source src="/video/hero_loop.mp4" type="video/mp4" />
      </video>

      {/* Legibility gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(27,22,18,.84) 0%, rgba(27,22,18,.90) 50%)',
          isolation: 'isolate',
        }}
        aria-hidden="true"
      />

      {/* Top social bar */}
      <div className="absolute inset-x-0 top-4 z-10 flex justify-center">
        <SocialIconsMask topBar size={22} gap="gap-5" />
      </div>

      {/* Foreground */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-8 md:pt-10">
        {/* Logo (blend + soft halo to hide imperfect edges) */}
        <Image
          src="/images/logo/logo-icon.png"
          alt="Jungle Bird — Tiki Cave & Lounge"
          width={460}
          height={210}
          priority
          className="mx-auto w-[320px] md:w-[460px]"
          style={{
            // Whites tuck into the background, but we keep the grayscale detail.
            mixBlendMode: 'multiply',
            // Soft halo to hide any faint matte edge; subtle contrast for crispness.
            filter:
              'drop-shadow(0 0 12px rgba(27,22,18,.48)) brightness(.97) contrast(1.08)',
            opacity: 0.98,
          }}
        />

        {/* CTAs */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <a
            href={OPENTABLE_URL}
            className="btn-pop btn-shadow brass-border rounded-full px-5 py-3 text-sm font-semibold"
            style={{ background: 'var(--cta)', color: '#1B1612' }}
          >
            Book Now
          </a>
          <Link
            href="/menu"
            className="brass-border rounded-full border px-5 py-3 text-sm font-semibold"
            style={{ color: 'var(--text)' }}
          >
            View Menu
          </Link>
        </div>
      </div>
    </section>
  );
}
