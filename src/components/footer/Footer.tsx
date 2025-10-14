import SocialIconsMask from '@/components/shared/SocialIconsMask';
import { ADDRESS, EMAIL } from '@/lib/constants';

export default function Footer() {
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
          <p style={{ color: 'var(--text)' }}>{ADDRESS}</p>
        </div>

        <div>
          <h5
            className="mb-2 text-sm tracking-wider uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Contact
          </h5>
          <p style={{ color: 'var(--text)' }}>
            <a
              className="underline underline-offset-4"
              href={`mailto:${EMAIL}`}
            >
              {EMAIL}
            </a>
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
            Sun–Thu: 5:00pm–1:00am
            <br />
            Fri–Sat: 5:00pm–2:00am
            <br />
            Mon: Closed
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
