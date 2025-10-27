// (SERVER)
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

const MAP_SRC =
  'https://www.google.com/maps?q=725A%2017%20Ave%20SW%2C%20Calgary%2C%20AB&output=embed';

export default async function Location() {
  const s = await client.fetch<Settings>(qSettings).catch(() => null);

  const address = s?.address?.trim() || '';
  const email = s?.email?.trim() || '';
  const phone = s?.phone?.trim() || '';
  const hours = s?.hours || [];

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: 'var(--surface)' }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="section-title mb-6 text-3xl md:text-4xl">Find Us</h3>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Map (constant) */}
          <div className="overflow-hidden rounded-2xl ring-1 ring-[var(--line)]">
            <iframe
              title={address ? `Map to ${address}` : 'Map'}
              src={MAP_SRC}
              className="h-72 w-full md:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
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
