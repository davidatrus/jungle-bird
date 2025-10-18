//  (CLIENT)
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/menu', label: 'Menu' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
];

export default function NavbarClient({
  openTableUrl,
}: {
  openTableUrl?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const linkClass =
    'px-2 py-1 text-[12px] tracking-[0.12em] uppercase hover:opacity-80';

  const hasOpenTable = !!openTableUrl?.trim();

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        borderColor: 'var(--line)',
        background: 'rgba(27,22,18,.92)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <nav className="mx-auto grid h-12 max-w-7xl grid-cols-[auto_1fr_auto] items-center px-4 md:h-14 lg:px-6">
        {/* Brand */}
        <Link
          href="/"
          aria-label="Jungle Bird home"
          className="flex items-center justify-self-start"
        >
          <Image
            src="/images/logo/icon.png"
            alt=""
            width={28}
            height={28}
            priority
            className="block h-8 w-8 md:h-10 md:w-10"
          />
        </Link>

        {/* Center links (desktop) */}
        <ul
          className="hidden items-center justify-center gap-6 text-[12px] md:flex xl:gap-8"
          style={{ color: 'var(--text)' }}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                className={linkClass}
                href={l.href}
                style={
                  pathname === l.href
                    ? { borderBottom: '2px solid var(--line)' }
                    : undefined
                }
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: Book Now (desktop) + Chevron (mobile) */}
        <div className="flex items-center gap-2 justify-self-end">
          <span className="hidden md:inline-flex">
            {hasOpenTable ? (
              <a
                href={openTableUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pop btn-shadow brass-border rounded-full px-4 py-2 text-[12px] font-semibold"
                style={{ background: 'var(--cta)', color: '#1B1612' }}
              >
                Book Now
              </a>
            ) : (
              <button
                className="brass-border cursor-not-allowed rounded-full px-4 py-2 text-[12px] font-semibold opacity-60"
                aria-disabled="true"
                title="Add your OpenTable URL in Site Settings to enable this"
                style={{
                  borderColor: 'var(--line)',
                  color: '#1B1612',
                  background: 'transparent',
                }}
              >
                Book Now
              </button>
            )}
          </span>

          {/* Chevron toggle (mobile) */}
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((s) => !s)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--line)] md:hidden"
            style={{
              color: 'var(--text)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        id="mobile-nav"
        className="overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-[max-height] duration-250 ease-in-out md:hidden"
        style={{
          maxHeight: open ? '280px' : '0px',
          background: 'rgba(27,22,18,.97)',
          borderTop: open ? '1px solid var(--line)' : '0',
        }}
      >
        <ul
          className="space-y-1 px-4 pt-3 pb-3"
          style={{ color: 'var(--text)' }}
        >
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block px-1 py-2 text-sm tracking-[0.12em] uppercase"
                  aria-current={active ? 'page' : undefined}
                >
                  <span
                    className={active ? 'inline-block border-b-2' : ''}
                    style={active ? { borderColor: 'var(--line)' } : undefined}
                  >
                    {l.label}
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="pt-2">
            {hasOpenTable ? (
              <a
                href={openTableUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pop brass-border inline-block w-full rounded-full px-4 py-2 text-center text-sm font-semibold"
                style={{ background: 'var(--cta)', color: '#1B1612' }}
              >
                Book Now
              </a>
            ) : (
              <button
                className="brass-border inline-block w-full cursor-not-allowed rounded-full px-4 py-2 text-center text-sm font-semibold opacity-60"
                aria-disabled="true"
                title="Add your OpenTable URL in Site Settings to enable this"
                style={{
                  borderColor: 'var(--line)',
                  color: '#1B1612',
                  background: 'transparent',
                }}
              >
                Book Now
              </button>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}
