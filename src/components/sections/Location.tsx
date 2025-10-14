import { ADDRESS, EMAIL } from '@/lib/constants';

const MAP_SRC =
  'https://www.google.com/maps?q=725A%2017%20Ave%20SW%2C%20Calgary%2C%20AB&output=embed';

export default function Location() {
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: 'var(--surface)' }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="section-title mb-6 text-3xl md:text-4xl">Find Us</h3>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Map */}
          <div className="overflow-hidden rounded-2xl ring-1 ring-[var(--line)]">
            <iframe
              title="Map to Jungle Bird (725A 17 Ave SW)"
              src={MAP_SRC}
              className="h-72 w-full md:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Details only (no Book button) */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg" style={{ color: 'var(--text)' }}>
                Address
              </h4>
              <p style={{ color: 'var(--muted)' }}>{ADDRESS}</p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=725A%2017%20Ave%20SW%2C%20Calgary%2C%20AB"
                className="mt-2 inline-block underline underline-offset-4"
                style={{ color: 'var(--text)' }}
              >
                Get Directions
              </a>
              <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                Basement entrance — our warm, ember-lit tiki-cave awaits.
              </p>
            </div>

            <div>
              <h4 className="text-lg" style={{ color: 'var(--text)' }}>
                Contact
              </h4>
              <p style={{ color: 'var(--muted)' }}>
                <a
                  href={`mailto:${EMAIL}`}
                  className="underline underline-offset-4"
                >
                  {EMAIL}
                </a>
              </p>
            </div>

            <div>
              <h4 className="text-lg" style={{ color: 'var(--text)' }}>
                Hours
              </h4>
              <p style={{ color: 'var(--muted)' }}>
                Sun–Thu: 5:00pm–1:00am
                <br />
                Fri–Sat: 5:00pm–2:00am
                <br />
                Mon: Closed
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
