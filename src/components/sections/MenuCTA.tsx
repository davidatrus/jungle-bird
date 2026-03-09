import { getVenueConfig, type VenueKey } from '@/lib/venueConfig';

export default function MenuCTA({
  venueKey = 'jungle_bird',
}: {
  venueKey?: VenueKey;
}) {
  const config = getVenueConfig(venueKey);
  const isProhibition = venueKey === 'prohibition';

  return (
    <section
      className={`relative text-center ${
        isProhibition ? 'border-y py-24 md:py-32' : 'py-20 md:py-28'
      }`}
      style={{
        borderColor: isProhibition ? 'rgba(196,154,99,0.35)' : undefined,
        background: `linear-gradient(180deg, rgba(0,0,0,0.56), rgba(0,0,0,0.78)), url('${config.menuCta.backgroundImageSrc}') center/cover no-repeat`,
      }}
    >
      <div className="mx-auto max-w-3xl px-4">
        <h3
          className={`section-title ${
            isProhibition
              ? 'mb-4 text-4xl md:text-6xl'
              : 'mb-3 text-3xl md:text-4xl'
          }`}
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.55)' }}
        >
          {config.menuCta.heading}
        </h3>

        <p
          className={`mx-auto mb-7 max-w-2xl ${
            isProhibition ? 'text-base leading-8 md:text-lg' : 'md:text-lg'
          }`}
          style={{
            color: 'var(--muted)',
            textShadow: '0 1px 8px rgba(0,0,0,0.55)',
          }}
        >
          {config.menuCta.subtext}
        </p>

        <a
          href={config.menuCta.href}
          className={`btn-pop btn-shadow inline-block rounded-full border px-6 py-3 text-sm font-semibold uppercase ${
            isProhibition ? 'tracking-[0.14em]' : ''
          }`}
          style={{
            background: 'var(--cta)',
            color: 'var(--cta-text)',
            borderColor: 'var(--line)',
          }}
        >
          View Menu
        </a>
      </div>
    </section>
  );
}
