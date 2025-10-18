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

      {/* Top social bar from Sanity; shows placeholders when empty */}
      <div className="absolute inset-x-0 top-4 z-10 flex justify-center">
        <SocialIconsMask
          topBar
          size={22}
          gap="gap-5"
          links={social ?? null}
          placeholders
        />
      </div>

      <div className="relative z-10 mx-auto flex flex-col items-center gap-[clamp(10px,1.4vw,16px)] px-6">
        <Image
          src="/images/logo/logo-icon.png"
          alt="Jungle Bird — Tiki Cave & Lounge"
          width={1526}
          height={973}
          priority
          quality={95}
          className="mx-auto h-auto max-h-[min(38svh,540px)] w-[clamp(280px,36vw,900px)]"
          sizes="(min-width:1280px) 900px, (min-width:768px) 36vw, 82vw"
        />

        <div className="flex flex-wrap items-center justify-center gap-4">
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
