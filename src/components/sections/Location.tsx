// (SERVER)
import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/sanity/client';
import { qSettings } from '@/sanity/queries';

export const revalidate = 60;

type Hour = { days: string; time: string };
type Settings = {
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  hours?: Hour[] | null;
};

// URL that opens Google Maps (not the embed URL)
const MAP_URL =
  'https://www.google.com/maps/place/725A+17+Ave+SW,+Calgary,+AB+T2S+0B7';

export default async function Location() {
  const s = await client.fetch<Settings>(qSettings).catch(() => null);

  const address = s?.address?.trim() || '';
  const email = s?.email?.trim() || '';
  const phone = s?.phone?.trim() || '';
  const hours = s?.hours || [];

  const mapAlt = address
    ? `Map showing Jungle Bird Tiki Lounge at ${address}`
    : 'Map showing Jungle Bird Tiki Lounge on 17th Ave SW in Calgary';

  const mapAriaLabel = address
    ? `Open Google Maps for ${address}`
    : 'Open Jungle Bird location on Google Maps';

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: 'var(--surface)' }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="section-title mb-6 text-3xl md:text-4xl">Find Us</h3>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Map - static image linking out to Google Maps */}
          <div className="overflow-hidden rounded-2xl ring-1 ring-[var(--line)]">
            <Link
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={mapAriaLabel}
              className="group relative block"
            >
              <Image
                src="/images/misc/jungle-bird-map.webp"
                alt={mapAlt}
                width={1200}
                height={800}
                className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />

              {/* subtle overlay + label */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

              <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/70 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-white uppercase">
                Open in Google Maps
              </div>
            </Link>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg" style={{ color: 'var(--text)' }}>
                Address
              </h4>
              <p style={{ color: 'var(--muted)' }}>{address || '—'}</p>
            </div>

            <div>
              <h4 className="text-lg" style={{ color: 'var(--text)' }}>
                Contact
              </h4>
              <div style={{ color: 'var(--muted)' }} className="space-y-1">
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
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="block underline underline-offset-4"
                  >
                    {phone}
                  </a>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg" style={{ color: 'var(--text)' }}>
                Hours
              </h4>
              <p style={{ color: 'var(--muted)' }}>
                {hours?.length
                  ? hours.map((h) => (
                      <span key={h.days + h.time} className="block">
                        {h.days}: {h.time}
                      </span>
                    ))
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
