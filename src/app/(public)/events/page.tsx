// src/app/(public)/events/page.tsx
import Link from 'next/link';
import { client } from '@/sanity/client';
import { qEventsList } from '@/sanity/queries';
import EventCard from '@/components/events/EventCard';
import { getAvailabilityBySanityEventIds } from '@/lib/eventsDb';
import { computeEventState } from '@/lib/eventState';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const revalidate = 60;

type SanityTicketType = {
  _key?: string;
  name?: string;
  currency?: string;
  priceCents?: number;
  capacity?: number;
  minPerOrder?: number;
  maxPerOrder?: number | null;
  ticketsOnSaleAt?: string | null;
  salesEndAt?: string | null;
};

type SanityEventListItem = {
  _id: string;
  _createdAt: string;
  title: string;
  slug: { current: string } | string;
  venueKey: string;
  status: string;
  startsAt: string;
  endsAt?: string | null;
  shortDescription?: string | null;
  isFeatured?: boolean;
  ticketTypes?: SanityTicketType[];
  heroImage?: SanityImageSource;
};

type View = 'upcoming' | 'past' | 'all';

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const view = (sp.view as View) || 'upcoming';

  const events = await client
    .fetch<SanityEventListItem[]>(qEventsList)
    .catch(() => []);

  const ids = events.map((e) => e._id);
  const availabilityMap = await getAvailabilityBySanityEventIds(ids);

  function safeTime(iso?: string | null) {
    if (!iso) return null;
    const t = Date.parse(iso);
    return Number.isFinite(t) ? t : null;
  }

  function getSortBucket(opts: {
    status: string;
    isEnded: boolean;
    isCancelled: boolean;
    salesEnded: boolean;
    soldOut: boolean;
  }) {
    // 0 = purchasable upcoming
    // 1 = sales ended OR sold out (but not ended)
    // 2 = ended
    // 3 = cancelled/draft/other (usually filtered out anyway)
    if (opts.isCancelled || opts.status === 'draft') return 3;
    if (opts.isEnded) return 2;
    if (opts.salesEnded || opts.soldOut) return 1;
    return 0;
  }

  const items = events.map((e) => {
    const av = availabilityMap[e._id]?.[0];
    const remainingCount =
      typeof av?.remaining === 'number' ? av.remaining : null;

    const firstTT = e.ticketTypes?.[0];

    const state = computeEventState({
      status: e.status,
      startsAt: e.startsAt,
      endsAt: e.endsAt ?? null,
      salesEndAt: firstTT?.salesEndAt ?? null,
      remainingCount,
    });

    const statusLower = (e.status || '').toLowerCase();
    const soldOut =
      typeof remainingCount === 'number' ? remainingCount <= 0 : false;

    const startsAtT = safeTime(e.startsAt) ?? Number.MAX_SAFE_INTEGER;
    const endsAtT = safeTime(e.endsAt) ?? startsAtT;

    const bucket = getSortBucket({
      status: statusLower,
      isEnded: state.isEnded,
      isCancelled: state.isCancelled,
      salesEnded: state.salesEnded,
      soldOut,
    });

    return { e, remainingCount, state, meta: { bucket, startsAtT, endsAtT } };
  });

  // Hide cancelled from list views
  const visible = items.filter(({ state, e }) => {
    const statusLower = (e.status || '').toLowerCase();
    return (
      !state.isCancelled &&
      statusLower !== 'cancelled' &&
      statusLower !== 'canceled'
    );
  });

  visible.sort((a, b) => {
    // 1) bucket priority
    if (a.meta.bucket !== b.meta.bucket) return a.meta.bucket - b.meta.bucket;

    // 2) within bucket
    // bucket 0/1: soonest start first
    if (a.meta.bucket === 0 || a.meta.bucket === 1) {
      return a.meta.startsAtT - b.meta.startsAtT;
    }

    // bucket 2: most recently ended first
    if (a.meta.bucket === 2) {
      return b.meta.endsAtT - a.meta.endsAtT;
    }

    // fallback: newest created first
    return (
      (Date.parse(b.e._createdAt) || 0) - (Date.parse(a.e._createdAt) || 0)
    );
  });

  const filtered =
    view === 'all'
      ? visible
      : view === 'past'
        ? visible.filter(({ state }) => state.isEnded || state.salesEnded)
        : visible.filter(({ state }) => !state.isEnded);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Events</h1>
        <p className="mt-2 text-white/70">
          Tickets are limited. Grab yours before they sell out.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={{ pathname: '/events', query: { view: 'upcoming' } }}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              view === 'upcoming'
                ? 'border-white/20 bg-white/10 text-white'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Upcoming
          </Link>

          <Link
            href={{ pathname: '/events', query: { view: 'past' } }}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              view === 'past'
                ? 'border-white/20 bg-white/10 text-white'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Past
          </Link>

          <Link
            href={{ pathname: '/events', query: { view: 'all' } }}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              view === 'all'
                ? 'border-white/20 bg-white/10 text-white'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            All
          </Link>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
          No events found for this filter.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(({ e, remainingCount }) => (
            <EventCard key={e._id} event={e} remainingCount={remainingCount} />
          ))}
        </div>
      )}
    </main>
  );
}
