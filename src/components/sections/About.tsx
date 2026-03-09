import { getVenueConfig, type VenueKey } from '@/lib/venueConfig';

export default function About({
  venueKey = 'jungle_bird',
}: {
  venueKey?: VenueKey;
}) {
  const config = getVenueConfig(venueKey);
  const isProhibition = venueKey === 'prohibition';

  return (
    <section
      className={isProhibition ? 'py-20 md:py-32' : 'py-16 md:py-24'}
      style={{ background: 'var(--surface)' }}
    >
      <div
        className={`mx-auto grid max-w-6xl grid-cols-1 items-center px-4 md:grid-cols-2 ${
          isProhibition ? 'gap-12 md:gap-16' : 'gap-10'
        }`}
      >
        <div
          className={`overflow-hidden ring-1 ${
            isProhibition
              ? 'rounded-[28px] ring-[var(--line)]'
              : 'rounded-3xl ring-[var(--ring)]'
          }`}
        >
          <img
            src={config.about.imageSrc}
            alt={config.about.imageAlt}
            className={`w-full object-cover ${
              isProhibition ? 'aspect-[4/5] md:aspect-[4/4.3]' : 'h-full'
            } ${isProhibition ? '' : 'sepia'}`}
          />
        </div>

        <div className={isProhibition ? 'max-w-[640px]' : ''}>
          <h2
            className={`section-title ${
              isProhibition
                ? 'mb-6 text-5xl leading-[0.95] md:text-7xl'
                : 'mb-4 text-3xl md:text-5xl'
            }`}
          >
            {config.about.heading}
          </h2>

          <div
            className={`space-y-4 ${
              isProhibition ? 'text-[1.05rem] leading-8 md:space-y-5' : ''
            }`}
            style={{ color: 'var(--muted)' }}
          >
            {config.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
