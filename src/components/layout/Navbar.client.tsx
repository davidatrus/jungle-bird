'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReservationModal from '@/components/shared/ReservationModal';

const links = [
  { href: '/menu', label: 'Menu' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/events', label: 'Events' },
  { href: '/contact', label: 'Contact' },
];

export default function NavbarClient() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setBookingOpen(false);
  }, [pathname]);

  const linkClass =
    'px-2 py-1 text-[12px] tracking-[0.12em] uppercase hover:opacity-80';

  return (
    <header className="nav-glass sticky top-0 z-40 border-b">
      <nav className="mx-auto grid h-12 max-w-7xl grid-cols-[auto_1fr_auto] items-center px-4 md:h-14 lg:px-6">
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

        <div className="flex items-center gap-2 justify-self-end">
          <span className="hidden md:inline-flex">
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="btn-pop btn-shadow brass-border nav-cta-btn rounded-full px-4 py-2 text-[12px] font-semibold"
            >
              Book Now
            </button>
          </span>

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
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setBookingOpen(true);
              }}
              className="btn-pop brass-border nav-cta-btn inline-block w-full rounded-full px-4 py-2 text-center text-sm font-semibold"
            >
              Book Now
            </button>
          </li>
        </ul>
      </div>

      {/* Render the shared modal ONCE */}
      <ReservationModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </header>
  );
}
