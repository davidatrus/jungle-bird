// src/components/events/EventCard.tsx
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
  status?: string;
  startsAt?: string;
  endsAt?: string | null;
  shortDescription?: string | null;
  ticketTypes?: SanityTicketType[];
  heroImage?: SanityImageSource;
};

const EVENT_TZ = process.env.NEXT_PUBLIC_EVENT_TIMEZONE || 'America/Edmonton';

function formatEventDateTime(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  // Similar to: 'EEE, MMM d, h:mm a'
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
  if (slug && typeof slug === 'object' && typeof slug.current === 'string')
    return slug.current;
  return '';
}

function computeBadges(opts: {
  status?: string;
  remainingCount: number | null;
  startsAt?: string;
  ticketsOnSaleAt?: string | null;
  salesEnded: boolean;
  isEnded: boolean;
}) {
  const badges: string[] = [];
  const status = (opts.status || '').toLowerCase();

  if (opts.isEnded || status === 'ended') badges.push('Ended');
  if (status === 'cancelled' || status === 'canceled') badges.push('Cancelled');

  if (status === 'on_sale' && opts.salesEnded && !opts.isEnded) {
    badges.push('Sales ended');
  }

  if (
    status === 'on_sale' &&
    !opts.salesEnded &&
    opts.remainingCount !== null
  ) {
    if (opts.remainingCount <= 0) badges.push('Sold Out');
  }

  // Happening soon (within 72h) — use raw Date math (timezone doesn’t matter for this comparison)
  if (
    status === 'on_sale' &&
    !opts.salesEnded &&
    !opts.isEnded &&
    opts.startsAt
  ) {
    const startMs = Date.parse(opts.startsAt);
    if (Number.isFinite(startMs)) {
      const diffHours = (startMs - Date.now()) / (1000 * 60 * 60);
      if (diffHours >= 0 && diffHours <= 72) badges.unshift('Happening soon');
    }
  }

  // New (on sale in last 72h)
  if (
    status === 'on_sale' &&
    !opts.salesEnded &&
    !opts.isEnded &&
    opts.ticketsOnSaleAt
  ) {
    const onSaleMs = Date.parse(opts.ticketsOnSaleAt);
    if (Number.isFinite(onSaleMs)) {
      const diffHours = (Date.now() - onSaleMs) / (1000 * 60 * 60);
      if (diffHours >= 0 && diffHours <= 72) badges.unshift('New');
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
    : null;

  const price = safeNumber(firstTT?.priceCents, 0) / 100;
  const currency = firstTT?.currency || 'cad';

  const badges = computeBadges({
    status: event.status,
    remainingCount,
    startsAt: event.startsAt,
    ticketsOnSaleAt: firstTT?.ticketsOnSaleAt ?? null,
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
      href={slug ? `/events/${slug}` : '/events'}
      aria-disabled={!slug}
      className={`group brass-border block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10 ${
        !slug ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      {imageSrc ? (
        <div className="relative">
          {/* Keeping <img> since you said warnings are ok */}
          <img
            src={imageSrc}
            alt={title}
            className="h-44 w-full object-cover sepia md:h-52"
            loading="lazy"
          />

          {badges.length ? (
            <div className="absolute top-3 right-3 flex gap-2">
              {badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-semibold text-white"
                >
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

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
