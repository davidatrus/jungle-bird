import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { sanityAdminClient } from '@/sanity/adminClient';

export const runtime = 'nodejs';

type SanityTicketType = {
  _key?: string;
  name?: string;
  currency?: string;
  priceCents?: number;
  capacity?: number;
  minPerOrder?: number;
  maxPerOrder?: number | null;
  salesEndAt?: string | null;
};

type SanityEvent = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  venueKey?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string | null;
  ticketTypes?: SanityTicketType[];
};

function badRequest(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

function assertToken(req: Request) {
  const incoming = req.headers.get('x-webhook-secret'); // Sanity sends X-Webhook-Secret (case-insensitive)
  const expected = process.env.SANITY_WEBHOOK_TOKEN;

  if (!expected)
    return { ok: false, error: 'Missing SANITY_WEBHOOK_TOKEN env var.' };
  if (!incoming || incoming !== expected)
    return { ok: false, error: 'Unauthorized.' };

  return { ok: true };
}

function normalizeEventStatus(input?: string) {
  // Map Sanity -> DB enum
  // DB: draft | on_sale | ended | cancelled
  switch ((input || '').toLowerCase()) {
    case 'on_sale':
    case 'onsale':
    case 'live':
      return 'on_sale';
    case 'ended':
      return 'ended';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    default:
      return 'draft';
  }
}

function normalizeCurrency(input?: string) {
  return (input || 'cad').toLowerCase();
}

export async function POST(req: Request) {
  const auth = assertToken(req);
  if (!auth.ok) return badRequest(auth.error || 'Unauthorized', 401);

  type SanityWebhookBody = {
    _id?: string;
    documentId?: string;
    ids?: string[];
  };

  let body: SanityWebhookBody;
  try {
    body = (await req.json()) as SanityWebhookBody;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  // Sanity webhooks usually send something like { _id: "..." } (or ids array depending on config)
  const sanityId: string | undefined =
    body?._id ||
    body?.documentId ||
    (Array.isArray(body?.ids) ? body.ids[0] : undefined);

  if (!sanityId) return badRequest('Missing Sanity document id (_id).');

  // Fetch the published event doc from Sanity
  // IMPORTANT: this fetch returns null if the published doc doesn’t exist (still draft, deleted, etc.)
  const event = await sanityAdminClient.fetch<SanityEvent | null>(
    `
    *[_type == "event" && _id == $id][0]{
      _id,
      title,
      slug,
      venueKey,
      status,
      startsAt,
      endsAt,
      ticketTypes[]{
        _key,
        name,
        currency,
        priceCents,
        capacity,
        minPerOrder,
        maxPerOrder,
        salesEndAt
      }
    }
    `,
    { id: sanityId },
  );

  if (!event) {
    // If it was unpublished/deleted, we do nothing for now.
    // Later we can add a "deactivate/cancel" behavior.
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'No published event found.',
    });
  }

  const sanityEventId = event._id;
  const sanitySlug = (event.slug?.current || '').trim();
  const venueKey = (event.venueKey || 'jungle_bird').trim();

  if (!sanitySlug) return badRequest('Event slug is missing in Sanity.');

  const title = (event.title || '').trim();
  const startsAt = event.startsAt ? new Date(event.startsAt) : null;
  const endsAt = event.endsAt ? new Date(event.endsAt) : null;

  if (!title) return badRequest('Event title missing in Sanity.');
  if (!startsAt || Number.isNaN(startsAt.getTime()))
    return badRequest('Event startsAt missing/invalid.');

  const status = normalizeEventStatus(event.status);

  const ticketTypes = Array.isArray(event.ticketTypes) ? event.ticketTypes : [];

  const client = await pool.connect();
  try {
    await client.query('begin');

    // Upsert event row (always allowed)
    const upsertEventRes = await client.query(
      `
      insert into public.events (sanity_event_id, sanity_slug, venue_key, title, starts_at, ends_at, status)
      values ($1, $2, $3, $4, $5, $6, $7::public.event_status)
      on conflict (sanity_event_id)
      do update set
        sanity_slug = excluded.sanity_slug,
        venue_key   = excluded.venue_key,
        title       = excluded.title,
        starts_at   = excluded.starts_at,
        ends_at     = excluded.ends_at,
        status      = excluded.status
      returning id
      `,
      [
        sanityEventId,
        sanitySlug,
        venueKey,
        title,
        startsAt.toISOString(),
        endsAt ? endsAt.toISOString() : null,
        status,
      ],
    );

    const eventId: string = upsertEventRes.rows[0].id;

    // Guardrail: if there are any PAID orders, lock down price/capacity/min/max changes
    const paidRes = await client.query(
      `
      select count(*)::int as paid_count
      from public.orders
      where event_id = $1 and status = 'paid'
      `,
      [eventId],
    );

    const hasPaidOrders = (paidRes.rows[0]?.paid_count ?? 0) > 0;

    // Ticket type upserts:
    // - Before any paid orders: allow full upsert of ticket types.
    // - After paid orders: allow only SAFE updates (name + sales_end_at). No price/capacity/min/max changes.
    let ticketTypesUpserted = 0;

    for (const tt of ticketTypes) {
      const sanityTicketTypeId = (tt._key || '').trim();
      const name = (tt.name || 'General Admission').trim();

      const currency = normalizeCurrency(tt.currency);
      const unitAmount = Number(tt.priceCents ?? 0);
      const capacity = Number(tt.capacity ?? 0);
      const minPerOrder = Number(tt.minPerOrder ?? 1);
      const maxPerOrder =
        tt.maxPerOrder === null || tt.maxPerOrder === undefined
          ? null
          : Number(tt.maxPerOrder);
      const salesEndAt = tt.salesEndAt ? new Date(tt.salesEndAt) : null;

      // If Sanity has no ticket type key, we can still upsert by (event_id, name) for MVP.
      // But having _key is better for stable syncing.
      if (!hasPaidOrders) {
        await client.query(
          `
          insert into public.ticket_types (
            event_id,
            sanity_ticket_type_id,
            name,
            currency,
            unit_amount_cents,
            capacity,
            min_per_order,
            max_per_order,
            sales_end_at
          )
          values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          on conflict (event_id, name)
          do update set
            sanity_ticket_type_id = excluded.sanity_ticket_type_id,
            currency = excluded.currency,
            unit_amount_cents = excluded.unit_amount_cents,
            capacity = excluded.capacity,
            min_per_order = excluded.min_per_order,
            max_per_order = excluded.max_per_order,
            sales_end_at = excluded.sales_end_at
          `,
          [
            eventId,
            sanityTicketTypeId || null,
            name,
            currency,
            unitAmount,
            capacity,
            minPerOrder,
            maxPerOrder,
            salesEndAt ? salesEndAt.toISOString() : null,
          ],
        );
        ticketTypesUpserted += 1;
      } else {
        // Safe updates only
        await client.query(
          `
          update public.ticket_types
          set
            name = $3,
            sales_end_at = $4
          where event_id = $1
            and (
              (sanity_ticket_type_id is not null and sanity_ticket_type_id = $2)
              or
              (sanity_ticket_type_id is null and name = $3)
            )
          `,
          [
            eventId,
            sanityTicketTypeId || null,
            name,
            salesEndAt ? salesEndAt.toISOString() : null,
          ],
        );
      }
    }

    await client.query('commit');

    return NextResponse.json({
      ok: true,
      eventId,
      sanityEventId,
      sanitySlug,
      hasPaidOrders,
      ticketTypesReceived: ticketTypes.length,
      ticketTypesUpserted,
    });
  } catch (err) {
    await client.query('rollback');
    console.error(err);
    return NextResponse.json({ error: 'Upsert failed.' }, { status: 500 });
  } finally {
    client.release();
  }
}
