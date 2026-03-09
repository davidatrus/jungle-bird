import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/sanity/client';
import { qSettings } from '@/sanity/queries';
import { getVenueConfig, type VenueKey } from '@/lib/venueConfig';

export const revalidate = 60;

type Hour = { days: string; time: string };
type Settings = {
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  hours?: Hour[] | null;
};

function buildMapsUrl(address: string) {
  const q = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export default async function Location({
  venueKey = 'jungle_bird',
}: {
  venueKey?: VenueKey;
}) {
  const s = await client
    .fetch<Settings>(qSettings, { venueKey })
    .catch(() => null);

  const config = getVenueConfig(venueKey);
  const isProhibition = venueKey === 'prohibition';

  const address = s?.address?.trim() || '';
  const email = s?.email?.trim() || '';
  const phone = s?.phone?.trim() || '';
  const hours = s?.hours || [];

  const brandName = config.brandName;

  const MAP_URL = address
    ? buildMapsUrl(address)
    : 'https://www.google.com/maps';

  const mapAlt = address
    ? `Map showing ${brandName} at ${address}`
    : config.location.imageAlt;

  const mapAriaLabel = address
    ? `Open Google Maps for ${address}`
    : `Open ${brandName} location on Google Maps`;

  return (
    <section
      className={isProhibition ? 'py-16 md:py-24' : 'py-16 md:py-24'}
      style={{ background: 'var(--surface)' }}
    >
      <div
        className={`mx-auto px-4 ${isProhibition ? 'max-w-6xl' : 'max-w-6xl'}`}
      >
        <h3
          className={`section-title ${
            isProhibition
              ? 'mb-8 text-4xl md:mb-8 md:text-6xl'
              : 'mb-6 text-3xl md:text-4xl'
          }`}
        >
          Find Us
        </h3>

        <div
          className={
            isProhibition
              ? 'grid grid-cols-1 gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-10'
              : 'grid grid-cols-1 gap-8 md:grid-cols-2'
          }
        >
          <div
            className={`overflow-hidden ring-1 ${
              isProhibition
                ? 'rounded-[28px] ring-[var(--line)]'
                : 'rounded-2xl ring-[var(--line)]'
            }`}
            style={
              isProhibition
                ? {
                    background:
                      'radial-gradient(circle at center, rgba(9,20,48,0.18) 0%, rgba(3,6,14,0.92) 100%)',
                  }
                : undefined
            }
          >
            <Link
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={mapAriaLabel}
              className={`group relative block ${
                isProhibition ? 'aspect-[4/3] md:aspect-[2048/700]' : ''
              }`}
            >
              <Image
                src={config.location.imageSrc}
                alt={mapAlt}
                width={2048}
                height={581}
                className={`w-full transition-transform duration-300 group-hover:scale-[1.02] ${
                  isProhibition ? 'h-full object-cover object-center' : 'h-auto'
                }`}
                loading="lazy"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

              <div
                className={`pointer-events-none absolute bottom-3 left-3 px-4 py-2 text-xs font-semibold uppercase ${
                  isProhibition
                    ? 'rounded-full border border-[var(--line)] bg-black/55 tracking-[0.2em] text-[var(--text)]'
                    : 'rounded-full bg-black/70 tracking-[0.16em] text-white'
                }`}
              >
                Open in Google Maps
              </div>
            </Link>
          </div>

          <div className={isProhibition ? 'space-y-7 pt-1' : 'space-y-6'}>
            <div>
              <h4
                className={`section-title ${
                  isProhibition ? 'mb-2 text-xl md:text-2xl' : 'text-lg'
                }`}
                style={{ color: 'var(--text)' }}
              >
                Address
              </h4>
              <p
                className={
                  isProhibition ? 'max-w-xl text-base leading-7 md:text-lg' : ''
                }
                style={{ color: 'var(--muted)' }}
              >
                {address || '—'}
              </p>
            </div>

            <div>
              <h4
                className={`section-title ${
                  isProhibition ? 'mb-2 text-xl md:text-2xl' : 'text-lg'
                }`}
                style={{ color: 'var(--text)' }}
              >
                Contact
              </h4>
              <div
                className={`space-y-2 ${isProhibition ? 'text-base leading-7 md:text-lg' : ''}`}
                style={{ color: 'var(--muted)' }}
              >
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="block underline underline-offset-4"
                  >
                    {email}
                  </a>
                ) : (
                  <span>—</span>
                )}

                {phone ? (
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="block underline underline-offset-4"
                  >
                    {phone}
                  </a>
                ) : null}
              </div>
            </div>

            <div>
              <h4
                className={`section-title ${
                  isProhibition ? 'mb-2 text-xl md:text-2xl' : 'text-lg'
                }`}
                style={{ color: 'var(--text)' }}
              >
                Hours
              </h4>
              <div
                className={
                  isProhibition ? 'text-base leading-7 md:text-lg' : ''
                }
                style={{ color: 'var(--muted)' }}
              >
                {hours?.length
                  ? hours.map((h) => (
                      <span key={h.days + h.time} className="block">
                        {h.days}: {h.time}
                      </span>
                    ))
                  : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
