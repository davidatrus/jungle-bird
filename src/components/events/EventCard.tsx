import Link from 'next/link';
import { urlFor } from '@/sanity/image';
import { computeEventState } from '@/lib/eventState';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

type SanityTicketType = {
  name?: string;
  currency?: string;
  priceCents?: number;
  capacity?: number;
  minPerOrder?: number;
  maxPerOrder?: number | null;
  ticketsOnSaleAt?: string | null;
  salesEndAt?: string | null;
};

type SanitySlug = string | { current?: string | null } | null | undefined;

type SanityEvent = {
  _id: string;
  title?: string;
  slug?: SanitySlug;
  venueKey?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string | null;
  shortDescription?: string | null;
  ticketTypes?: SanityTicketType[];
  heroImage?: SanityImageSource;
};

type Badge = {
  label: string;
  className: string;
};

const EVENT_TZ = process.env.NEXT_PUBLIC_EVENT_TIMEZONE || 'America/Edmonton';

function formatEventDateTime(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: EVENT_TZ,
  }).format(d);
}

function currencySymbol(code?: string) {
  const c = (code || 'cad').toLowerCase();
  if (c === 'usd') return '$';
  if (c === 'eur') return '€';
  return '$';
}

function safeNumber(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function getSlugValue(slug: SanitySlug): string {
  if (typeof slug === 'string') return slug;
  if (slug && typeof slug === 'object' && typeof slug.current === 'string') {
    return slug.current;
  }
  return '';
}

function getEventHref(venueKey: string | undefined, slug: string) {
  const base = venueKey === 'prohibition' ? '/prohibition/events' : '/events';
  return slug ? `${base}/${slug}` : base;
}

function getFallbackImage(venueKey?: string) {
  return venueKey === 'prohibition'
    ? '/images/og/prohibition-og.webp'
    : '/images/og/jungle-bird-og.webp';
}

function computeBadges(opts: {
  status?: string;
  remainingCount: number | null;
  capacity?: number;
  salesEnded: boolean;
  isEnded: boolean;
}) {
  const badges: Badge[] = [];
  const status = (opts.status || '').toLowerCase();

  if (status === 'cancelled' || status === 'canceled') {
    badges.push({
      label: 'Cancelled',
      className: 'border-red-400/30 bg-red-500/15 text-red-200',
    });
    return badges;
  }

  if (opts.isEnded || status === 'ended') {
    badges.push({
      label: 'Ended',
      className: 'border-red-400/30 bg-red-500/15 text-red-200',
    });
    return badges;
  }

  if (status === 'on_sale' && opts.salesEnded) {
    badges.push({
      label: 'Sales ended',
      className: 'border-white/15 bg-white/10 text-white/80',
    });
    return badges;
  }

  if (status === 'on_sale' && opts.remainingCount !== null) {
    if (opts.remainingCount <= 0) {
      badges.push({
        label: 'Sold Out',
        className: 'border-red-400/30 bg-red-500/15 text-red-200',
      });
      return badges;
    }

    const capacity = opts.capacity ?? 0;
    const ratio = capacity > 0 ? opts.remainingCount / capacity : null;

    if (ratio !== null && ratio <= 0.15) {
      badges.push({
        label: 'Almost Sold Out',
        className: 'border-amber-400/30 bg-amber-500/15 text-amber-200',
      });
    } else {
      badges.push({
        label: 'Upcoming',
        className: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
      });
    }
  }

  return badges;
}

export default function EventCard({
  event,
  remainingCount,
}: {
  event: SanityEvent;
  remainingCount: number | null;
}) {
  const slug = getSlugValue(event.slug);
  const href = getEventHref(event.venueKey, slug);

  const title = event.title || 'Event';
  const firstTT = event.ticketTypes?.[0];

  const state = computeEventState({
    status: event.status,
    startsAt: event.startsAt,
    endsAt: event.endsAt ?? null,
    salesEndAt: firstTT?.salesEndAt ?? null,
    remainingCount,
  });

  const imageSrc = event.heroImage
    ? urlFor(event.heroImage).width(1600).height(700).fit('crop').url()
    : getFallbackImage(event.venueKey);

  const price = safeNumber(firstTT?.priceCents, 0) / 100;
  const currency = firstTT?.currency || 'cad';
  const capacity = safeNumber(firstTT?.capacity, 0);

  const badges = computeBadges({
    status: event.status,
    remainingCount,
    capacity,
    salesEnded: state.salesEnded,
    isEnded: state.isEnded,
  });

  const timeIso = state.isEnded
    ? event.endsAt || event.startsAt
    : event.startsAt;

  const timeText = formatEventDateTime(timeIso);
  const timePrefix = state.isEnded ? 'Ended:' : 'Starts at:';

  const remainingText =
    state.isOnSale && !state.salesEnded && remainingCount !== null
      ? `${Math.max(0, remainingCount)} left`
      : '';

  const ctaText = state.isEnded ? 'View recap →' : 'View details →';

  return (
    <Link
      href={href}
      aria-disabled={!slug}
      className={`group brass-border block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10 ${
        !slug ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={title}
          className="h-44 w-full object-cover sepia md:h-52"
          loading="lazy"
        />

        {badges.length ? (
          <div className="absolute top-3 right-3 flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.label}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${b.className}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="p-6">
        <h3 className="text-2xl text-white">{title.toUpperCase()}</h3>

        {timeText ? (
          <div className="mt-2 text-white/70">
            <span className="text-white/60">{timePrefix}</span> {timeText}
          </div>
        ) : null}

        {event.shortDescription ? (
          <p className="mt-3 line-clamp-3 text-sm text-white/70">
            {event.shortDescription}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-white/80">
            {price > 0 ? (
              <span>
                Price: {currencySymbol(currency)}
                {price.toFixed(2)}
              </span>
            ) : null}
          </div>

          <div className="text-sm text-white/60">{remainingText}</div>
        </div>

        <div className="mt-5 text-sm font-semibold text-white/90">
          {ctaText}
        </div>
      </div>
    </Link>
  );
}
