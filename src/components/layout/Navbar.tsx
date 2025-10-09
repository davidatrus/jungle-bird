'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const links = [
  { href: '/menu', label: 'Menu' },
  { href: '/reservations', label: 'Reservations' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change / esc
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const linkClass =
    'px-2 py-1 text-[12px] tracking-[0.12em] uppercase hover:opacity-80';

  const activeStyle = (href: string) =>
    pathname === href ? { borderBottom: '2px solid var(--line)' } : undefined;

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        borderColor: 'var(--line)',
        background: 'rgba(27,22,18,.92)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Grid keeps brand left, center links centered, menu button right */}
      <nav className="mx-auto grid h-12 max-w-7xl grid-cols-[auto_1fr_auto] items-center px-4 md:h-14 lg:px-6">
        {/* Brand */}
        <div className="justify-self-start">
          <Link
            href="/"
            className="font-display text-[18px] tracking-[0.02em] md:text-[20px]"
            style={{ color: 'var(--text)' }}
          >
            Jungle Bird
          </Link>
        </div>

        {/* Centered links on md+ */}
        <ul
          className="hidden items-center justify-center gap-6 text-[12px] md:flex xl:gap-8"
          style={{ color: 'var(--text)' }}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                className={linkClass}
                style={activeStyle(l.href)}
                href={l.href}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <div className="justify-self-end md:hidden">
          <button
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex appearance-none items-center justify-center rounded-md px-2 py-1 ring-0 transition outline-none select-none focus:ring-0 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--line)] active:scale-[0.98]"
            style={{
              color: 'var(--text)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span className="block h-[2px] w-6 bg-[var(--text)]" />
            <span className="mt-1.5 block h-[2px] w-6 bg-[var(--text)]" />
            <span className="mt-1.5 block h-[2px] w-6 bg-[var(--text)]" />
          </button>
        </div>
      </nav>

      {/* Slide-down panel on mobile */}
      <div
        id="mobile-nav"
        className={`overflow-hidden transition-[max-height] duration-200 ease-out md:hidden`}
        style={{
          maxHeight: open ? '240px' : '0px',
          background: 'rgba(27,22,18,.97)',
          borderTop: open ? '1px solid var(--line)' : '0',
        }}
      >
        <ul className="space-y-2 px-4 py-3" style={{ color: 'var(--text)' }}>
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block px-1 py-2 text-sm tracking-[0.12em] uppercase"
                style={activeStyle(l.href)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
