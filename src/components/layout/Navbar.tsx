'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/menu', label: 'Menu' },
  { href: '/reservations', label: 'Reservations' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href));

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        borderColor: 'var(--line)',
        background: 'rgba(27,22,18,.92)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* RELATIVE container so we can absolutely center links and pin brand left */}
      <nav className="relative mx-auto w-full px-4 lg:px-6">
        {/* Fixed height to perfectly center absolute children */}
        <div className="h-[48px] md:h-[56px]" />

        {/* Brand — pinned left */}
        <Link
          href="/"
          aria-label="Jungle Bird Home"
          className="font-display absolute top-1/2 left-4 -translate-y-1/2 text-lg tracking-[0.02em] md:text-xl lg:left-6"
          style={{ color: 'var(--text)' }}
        >
          Jungle Bird
        </Link>

        {/* Centered links — desktop */}
        <ul
          className="font-ui absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-7 text-[12px] tracking-[0.12em] uppercase md:flex xl:gap-9"
          style={{ color: 'var(--text)' }}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="nav-link transition-opacity hover:opacity-80"
                aria-current={isActive(l.href) ? 'page' : undefined}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile: centered inline links; brand stays pinned left */}
        <ul
          className="font-ui absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-5 text-[12px] tracking-[0.12em] uppercase md:hidden"
          style={{ color: 'var(--text)' }}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="nav-link transition-opacity hover:opacity-80"
                aria-current={isActive(l.href) ? 'page' : undefined}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
