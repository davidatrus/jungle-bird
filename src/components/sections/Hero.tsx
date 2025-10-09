import SocialIconsMask from '@/components/shared/SocialIconsMask';

export default function Hero() {
  return (
    <section
      className="relative flex min-h-[70vh] items-center overflow-hidden md:min-h-[80vh]"
      // Show the poster image while the video buffers (and as a fallback)
      style={{ background: "url('/images/hero.jpg') center/cover no-repeat" }}
    >
      {/* BG video */}
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/hero.jpg"
        aria-hidden="true"
      >
        <source src="/video/hero_loop.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(27,22,18,.84) 0%, rgba(27,22,18,.90) 50%)',
        }}
        aria-hidden="true"
      />

      {/* Top social bar */}
      <div className="absolute inset-x-0 top-4 z-10 flex justify-center">
        <SocialIconsMask topBar size={28} gap="gap-6" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
        <p className="small-caps mb-4" style={{ color: 'var(--muted)' }}>
          Cocktail Lounge • Calgary
        </p>

        <h1
          className="text-5xl leading-[0.95] md:text-7xl"
          style={{ color: 'var(--text)' }}
        >
          JUNGLE BIRD
        </h1>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="/reservations"
            className="btn-pop btn-shadow brass-border rounded-full px-5 py-3 text-sm font-medium"
            style={{ background: 'var(--cta)', color: '#1B1612' }}
          >
            Reserve a Table
          </a>

          <a
            href="/menu"
            className="btn-pop brass-border rounded-full border px-5 py-3 text-sm font-medium"
            style={{ color: 'var(--text)' }}
          >
            View Menu
          </a>
        </div>
      </div>
    </section>
  );
}
