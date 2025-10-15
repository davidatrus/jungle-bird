import SocialIconsMask from '@/components/shared/SocialIconsMask';
import { client } from '@/sanity/client';
import { qSettings } from '@/sanity/queries';

export const revalidate = 60;

type Hour = { days: string; time: string };
type Settings = {
  address?: string;
  email?: string;
  hours?: Hour[];
};

export default async function Footer() {
  const s = await client.fetch<Settings>(qSettings).catch(() => null);

  return (
    <footer
      className="border-t py-12"
      style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4">
        <div>
          <h5
            className="mb-2 text-sm tracking-wider uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Address
          </h5>
          <p style={{ color: 'var(--text)' }} className="whitespace-pre-line">
            {s?.address || '—'}
          </p>
        </div>

        <div>
          <h5
            className="mb-2 text-sm tracking-wider uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Contact
          </h5>
          <p style={{ color: 'var(--text)' }}>
            {s?.email ? (
              <a
                className="underline underline-offset-4"
                href={`mailto:${s.email}`}
              >
                {s.email}
              </a>
            ) : (
              '—'
            )}
          </p>
        </div>

        <div>
          <h5
            className="mb-2 text-sm tracking-wider uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Hours
          </h5>
          <p style={{ color: 'var(--text)' }}>
            {s?.hours?.length
              ? s.hours.map((h: Hour) => (
                  <span key={h.days + h.time} className="block">
                    {h.days}: {h.time}
                  </span>
                ))
              : '—'}
          </p>
        </div>

        <div>
          <h5
            className="mb-2 text-sm tracking-wider uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Follow
          </h5>
          <SocialIconsMask size={22} gap="gap-4" />
        </div>
      </div>

      <div
        className="mt-8 text-center text-xs"
        style={{ color: 'var(--muted)' }}
      >
        © {new Date().getFullYear()} Jungle Bird
      </div>
    </footer>
  );
}
