// src/components/sections/Hero.client.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import SocialIconsMask from '@/components/shared/SocialIconsMask';

type Social = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  snapchat?: string;
};

type Props = {
  social?: Social | null;
  openTableUrl?: string | null;
};

export default function HeroClient({ social, openTableUrl }: Props) {
  const vidRef = useRef<HTMLVideoElement>(null);

  // 🔧 Toggle this later if you want the bird back
  const SHOW_ICON = false;

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

  const hasOpenTable = !!openTableUrl;

  return (
    <section className="relative flex min-h-[70svh] items-center justify-center overflow-hidden">
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
        <source src="/video/hero_loop.mp4" type="video/mp4" />
      </video>

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
        <SocialIconsMask
          topBar
          size={22}
          gap="gap-5"
          links={social ?? null}
          placeholders
        />
      </div>

      {/* Center stack */}
      <div className="relative z-10 mx-auto flex flex-col items-center gap-[clamp(10px,1.4vw,16px)] px-6 text-center">
        {/* ICON (hidden via flag, kept for later) */}
        {SHOW_ICON && (
          <div className="mx-auto h-[clamp(72px,10vw,144px)] w-[clamp(72px,10vw,144px)]">
            <Image
              src="/images/logo/logo-icon.png"
              alt="Jungle Bird icon"
              width={512}
              height={512}
              priority
              quality={95}
              className="h-full w-full object-contain drop-shadow-2xl"
            />
          </div>
        )}

        {/* Big Title */}
        <h1 className="font-begum text-[clamp(44px,6.6vw,96px)] leading-none tracking-tight text-white [text-shadow:0_6px_30px_rgba(0,0,0,.55)]">
          JUNGLE BIRD
        </h1>

        {/* Subtitle */}
        <p className="font-mikado text-[clamp(16px,2.2vw,28px)] tracking-[0.14em] text-white/95 uppercase [text-shadow:0_6px_30px_rgba(0,0,0,.55)]">
          Tiki Cave &amp; Lounge
        </p>

        {/* CTAs */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
          {hasOpenTable ? (
            <a
              href={openTableUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop btn-shadow brass-border rounded-full px-5 py-3 text-sm font-semibold"
              style={{ background: 'var(--cta)', color: '#1B1612' }}
            >
              Book Now
            </a>
          ) : (
            <button
              className="brass-border cursor-not-allowed rounded-full px-5 py-3 text-sm font-semibold opacity-60"
              aria-disabled="true"
              title="Add your OpenTable URL in Site Settings to enable this"
              style={{ borderColor: 'var(--line)', color: 'var(--text)' }}
            >
              Book Now
            </button>
          )}

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
