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
    <header className="nav-glass sticky top-0 z-40 border-b">
      <nav className="mx-auto grid h-12 max-w-7xl grid-cols-[auto_1fr_auto] items-center px-4 md:h-14 lg:px-6">
        {/* Brand */}
        <Link
          href="/"
          aria-label="Jungle Bird home"
          className="flex items-center justify-self-start"
        >
          <Image
            src="/images/logo/icon.png"
            alt="Jungle Bird Tiki Lounge YYC logo"
            width={28}
            height={28}
            className="block h-8 w-8 md:h-10 md:w-10"
            loading="lazy"
          />
        </Link>

        {/* Center links (desktop) */}
        <ul className="text-nav hidden items-center justify-center gap-6 text-[12px] md:flex xl:gap-8">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  className={`${linkClass} ${
                    active ? 'border-nav-line border-b-2' : ''
                  }`}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right: Book Now (desktop) + Chevron (mobile) */}
        <div className="flex items-center gap-2 justify-self-end">
          <span className="hidden md:inline-flex">
            {hasOpenTable ? (
              <a
                href={openTableUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pop btn-shadow brass-border nav-cta-btn rounded-full px-4 py-2 text-[12px] font-semibold"
              >
                Book Now
              </a>
            ) : (
              <button
                className="brass-border nav-cta-btn-disabled rounded-full px-4 py-2 text-[12px] font-semibold opacity-60"
                aria-disabled="true"
                title="Add your OpenTable URL in Site Settings to enable this"
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
            className="text-nav no-tap-highlight inline-flex h-8 w-8 items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--line)] md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-5 w-5 transition-transform duration-200 ${
                open ? 'rotate-180' : 'rotate-0'
              }`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        id="mobile-nav"
        className={`mobile-nav overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-[max-height] duration-250 ease-in-out md:hidden ${
          open ? 'border-nav-line max-h-[280px] border-t' : 'max-h-0 border-t-0'
        }`}
      >
        <ul className="text-nav space-y-1 px-4 pt-3 pb-3">
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
                    className={
                      active ? 'border-nav-line inline-block border-b-2' : ''
                    }
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
                className="btn-pop brass-border nav-cta-btn inline-block w-full rounded-full px-4 py-2 text-center text-sm font-semibold"
              >
                Book Now
              </a>
            ) : (
              <button
                className="brass-border nav-cta-btn-disabled inline-block w-full cursor-not-allowed rounded-full px-4 py-2 text-center text-sm font-semibold opacity-60"
                aria-disabled="true"
                title="Add your OpenTable URL in Site Settings to enable this"
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
