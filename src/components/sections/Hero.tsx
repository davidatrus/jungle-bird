import SocialIconsMask from '@/components/shared/SocialIconsMask';

export default function Hero() {
  return (
    <section
      className="relative flex min-h-[70vh] items-center md:min-h-[80vh]"
      style={{
        background:
          "linear-gradient(180deg, rgba(27,22,18,.84) 0%, rgba(27,22,18,.90) 50%), url('/images/hero.jpg') center/cover no-repeat",
      }}
    >
      {/* Top social bar */}
      <div className="absolute inset-x-0 top-4 z-10 flex justify-center">
        <SocialIconsMask topBar size={28} gap="gap-6" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
        {/* label + title share the same centering, so edges line up visually */}
        <p className="small-caps mb-4" style={{ color: 'var(--muted)' }}>
          Cocktail Lounge • Calgary
        </p>

        <h1
          className="text-5xl leading-[0.95] md:text-7xl"
          style={{ color: 'var(--text)' }}
        >
          JUNGLE BIRD
        </h1>

        {/* CTAs centered under title */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="/reservations"
            className="brass-border rounded-full px-5 py-3 text-sm font-medium"
            style={{ background: 'var(--cta)', color: '#1B1612' }}
          >
            Reserve a Table
          </a>
          <a
            href="/menu"
            className="brass-border rounded-full border px-5 py-3 text-sm font-medium"
            style={{ color: 'var(--text)' }}
          >
            View Menu
          </a>
        </div>
      </div>
    </section>
  );
}
