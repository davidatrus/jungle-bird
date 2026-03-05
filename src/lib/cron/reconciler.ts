// src/lib/cron/reconciler.ts
import type { PoolClient } from 'pg';
import { client as sanityClient } from '@/sanity/client';

type SanityEventForSync = {
  _id: string;
  title?: string;
  slug?: string | { current?: string };
  venueKey?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string | null;
  ticketTypes?: Array<{
    name?: string;
    currency?: string;
    priceCents?: number;
    capacity?: number;
    minPerOrder?: number;
    maxPerOrder?: number | null;
    salesEndAt?: string | null;
  }>;
};

function getSlugValue(slug: SanityEventForSync['slug']) {
  if (!slug) return '';
  if (typeof slug === 'string') return slug;
  return slug.current || '';
}

function safeInt(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function safeText(v: unknown, fallback = '') {
  return typeof v === 'string' ? v : fallback;
}

/**
 * 1) Release expired holds in public.inventory_holds
 * status enum: active | converted | released
 */
export async function releaseExpiredHolds(client: PoolClient) {
  const res = await client.query(
    `
    update public.inventory_holds
    set status = 'released'
    where status = 'active'
      and expires_at <= now()
    returning id
    `,
  );

  return { released: res.rowCount };
}

/**
 * 2) Reconcile Sanity -> DB
 * Fetches "on_sale" and "ended" events from Sanity and upserts into:
 * - public.events
 * - public.ticket_types (unique (event_id, name))
 *
 * This is the safety net in case your webhook misses.
 */
export async function reconcileSanityToDb(client: PoolClient) {
  const q = /* groq */ `
    *[_type == "event" && status in ["on_sale","ended","cancelled","draft"]]{
      _id,
      title,
      "slug": slug.current,
      venueKey,
      status,
      startsAt,
      endsAt,
      ticketTypes[]{
        name,
        currency,
        priceCents,
        capacity,
        minPerOrder,
        maxPerOrder,
        salesEndAt
      }
    }
  `;

  const sanityEvents = await sanityClient
    .fetch<SanityEventForSync[]>(q)
    .catch(() => []);
  if (!sanityEvents.length)
    return { eventsUpserted: 0, ticketTypesUpserted: 0 };

  let eventsUpserted = 0;
  let ticketTypesUpserted = 0;

  for (const e of sanityEvents) {
    const sanityEventId = e._id;
    const title = safeText(e.title, 'Event');
    const sanitySlug = getSlugValue(e.slug);
    const venueKey = safeText(e.venueKey, 'jungle_bird');

    const status = safeText(e.status, 'draft'); // your enum: draft/on_sale/ended/cancelled
    const startsAt = e.startsAt ? new Date(e.startsAt) : null;
    const endsAt = e.endsAt ? new Date(e.endsAt) : null;

    if (!sanityEventId || !sanitySlug || !startsAt) continue;

    // Upsert event
    const evRes = await client.query(
      `
      insert into public.events (
        sanity_event_id,
        sanity_slug,
        venue_key,
        title,
        starts_at,
        ends_at,
        status
      )
      values ($1,$2,$3,$4,$5,$6,$7::public.event_status)
      on conflict (sanity_event_id)
      do update set
        sanity_slug = excluded.sanity_slug,
        venue_key = excluded.venue_key,
        title = excluded.title,
        starts_at = excluded.starts_at,
        ends_at = excluded.ends_at,
        status = excluded.status,
        updated_at = now()
      returning id
      `,
      [sanityEventId, sanitySlug, venueKey, title, startsAt, endsAt, status],
    );

    eventsUpserted += 1;
    const eventId = evRes.rows[0]?.id as string | undefined;
    if (!eventId) continue;

    // Ticket Types: for now you’re using ticketTypes[0] as MVP, but we can safely upsert all
    const tts = Array.isArray(e.ticketTypes) ? e.ticketTypes : [];
    for (const tt of tts) {
      const name = safeText(tt?.name, 'General Admission');
      const currency = safeText(tt?.currency, 'cad');
      const unitAmountCents = safeInt(tt?.priceCents, 0);
      const capacity = safeInt(tt?.capacity, 0);
      const minPerOrder = Math.max(1, safeInt(tt?.minPerOrder, 1));
      const maxPerOrderRaw =
        tt?.maxPerOrder === null || tt?.maxPerOrder === undefined
          ? null
          : safeInt(tt.maxPerOrder, 1);
      const maxPerOrder =
        maxPerOrderRaw === null ? null : Math.max(1, maxPerOrderRaw);
      const salesEndAt = tt?.salesEndAt ? new Date(tt.salesEndAt) : null;

      // Skip useless ticket types
      if (!name || unitAmountCents <= 0) continue;

      await client.query(
        `
        insert into public.ticket_types (
          event_id,
          name,
          currency,
          unit_amount_cents,
          capacity,
          min_per_order,
          max_per_order,
          sales_end_at
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8)
        on conflict (event_id, name)
        do update set
          currency = excluded.currency,
          unit_amount_cents = excluded.unit_amount_cents,
          capacity = excluded.capacity,
          min_per_order = excluded.min_per_order,
          max_per_order = excluded.max_per_order,
          sales_end_at = excluded.sales_end_at,
          updated_at = now()
        `,
        [
          eventId,
          name,
          currency,
          unitAmountCents,
          capacity,
          minPerOrder,
          maxPerOrder,
          salesEndAt,
        ],
      );

      ticketTypesUpserted += 1;
    }
  }

  return { eventsUpserted, ticketTypesUpserted };
}

/**
 * 3) Availability reconcile
 * Ensures ticket_types.sold_count matches paid orders (including 0)
 */
export async function reconcileAvailability(client: PoolClient) {
  // 1) Update ticket_types.sold_count from paid orders
  const res = await client.query(
    `
    with sold as (
      select
        o.ticket_type_id,
        coalesce(sum(o.quantity), 0)::int as sold_count
      from public.orders o
      where o.status = 'paid'
      group by o.ticket_type_id
    )
    update public.ticket_types tt
    set sold_count = coalesce(s.sold_count, 0),
        updated_at = now()
    from sold s
    where tt.id = s.ticket_type_id
    returning tt.id
    `,
  );

  // 2) OPTIONAL: if you have a second query now (res2), keep this pattern:
  // const res2 = await client.query(`...`);

  const updatedFromOrders = res.rowCount ?? 0;
  // const updatedOther = res2.rowCount ?? 0;

  return {
    // if you’re returning both:
    // ticketTypesUpdated: updatedFromOrders + updatedOther,

    // if you’re returning just one:
    ticketTypesUpdated: updatedFromOrders,
  };
}
