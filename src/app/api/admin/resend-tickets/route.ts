// src/app/api/admin/resend-tickets/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { buildTicketsEmailPayload } from '@/lib/ticketsEmail';
import { Resend } from 'resend';
import type { VenueKey } from '@/lib/venueConfig';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY as string);

type LookupBody = {
  action: 'lookup' | 'resend';
  orderId?: string;
  sessionId?: string;
  buyerEmail?: string;
};

function getAuthToken(req: Request) {
  const h = req.headers.get('authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

function normalizeVenueKey(value: string | null | undefined): VenueKey {
  return value === 'prohibition' ? 'prohibition' : 'jungle_bird';
}

function getVenueEmailBranding(venueKey: VenueKey) {
  if (venueKey === 'prohibition') {
    return {
      from: 'Prohibition Tickets <tickets@junglebirdtikiyyc.com>',
      subjectFallback: 'Prohibition Event',
    };
  }

  return {
    from: 'Jungle Bird Tickets <tickets@junglebirdtikiyyc.com>',
    subjectFallback: 'Jungle Bird Event',
  };
}

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function findOrder(input: { orderId?: string; sessionId?: string }) {
  if (input.orderId) {
    const res = await pool.query(
      `
      select
        o.id,
        o.status,
        o.buyer_first_name,
        o.buyer_last_name,
        o.buyer_email,
        o.quantity,
        o.unit_amount_cents,
        o.currency,
        o.email_sent_at,
        o.stripe_checkout_session_id,
        e.title as event_title,
        e.starts_at,
        e.ends_at,
        e.venue_key
      from public.orders o
      join public.events e on e.id = o.event_id
      where o.id = $1
      limit 1
      `,
      [input.orderId],
    );
    return res.rows[0] ?? null;
  }

  if (input.sessionId) {
    const res = await pool.query(
      `
      select
        o.id,
        o.status,
        o.buyer_first_name,
        o.buyer_last_name,
        o.buyer_email,
        o.quantity,
        o.unit_amount_cents,
        o.currency,
        o.last_ticket_resent_at,
        o.ticket_email_send_count,
        o.email_sent_at,
        o.stripe_checkout_session_id,
        e.title as event_title,
        e.starts_at,
        e.ends_at,
        e.venue_key
      from public.orders o
      join public.events e on e.id = o.event_id
      where o.stripe_checkout_session_id = $1
      limit 1
      `,
      [input.sessionId],
    );
    return res.rows[0] ?? null;
  }

  return null;
}

export async function POST(req: Request) {
  const expected = process.env.ADMIN_SCAN_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: 'Missing ADMIN_SCAN_TOKEN env var' },
      { status: 500 },
    );
  }

  const token = getAuthToken(req);
  if (!token || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: LookupBody;
  try {
    body = (await req.json()) as LookupBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = body.action;
  const orderId = (body.orderId || '').trim();
  const sessionId = (body.sessionId || '').trim();
  const buyerEmail = (body.buyerEmail || '').trim().toLowerCase();

  if (!action || !['lookup', 'resend'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!orderId && !sessionId) {
    return NextResponse.json(
      { error: 'Provide orderId or sessionId' },
      { status: 400 },
    );
  }

  const order = (await findOrder({ orderId, sessionId })) as {
    id: string;
    status: string;
    buyer_first_name: string;
    buyer_last_name: string;
    buyer_email: string;
    quantity: number;
    unit_amount_cents: number;
    currency: string;
    email_sent_at: string | null;
    last_ticket_resent_at: string | null;
    ticket_email_send_count: number;
    stripe_checkout_session_id: string | null;
    event_title: string;
    starts_at: string | null;
    ends_at: string | null;
    venue_key: string | null;
  } | null;

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const venueKey = normalizeVenueKey(order.venue_key);
  const branding = getVenueEmailBranding(venueKey);

  const lookupPayload = {
    ok: true,
    order: {
      id: order.id,
      status: order.status,
      buyer_name: `${order.buyer_first_name} ${order.buyer_last_name}`.trim(),
      buyer_email: order.buyer_email,
      quantity: order.quantity,
      unit_amount_cents: order.unit_amount_cents,
      currency: order.currency,
      email_sent_at: order.email_sent_at,
      last_ticket_resent_at: order.last_ticket_resent_at,
      ticket_email_send_count: order.ticket_email_send_count,
      stripe_checkout_session_id: order.stripe_checkout_session_id,
      event_title: order.event_title,
      starts_at: order.starts_at,
      ends_at: order.ends_at,
      venue_key: venueKey,
    },
  };

  if (action === 'lookup') {
    return NextResponse.json(lookupPayload);
  }

  if (order.status !== 'paid') {
    return NextResponse.json(
      {
        error: `Only paid orders can resend tickets (got '${order.status}')`,
        ...lookupPayload,
      },
      { status: 400 },
    );
  }

  if (buyerEmail && !isEmail(buyerEmail)) {
    return NextResponse.json(
      { error: 'buyerEmail must be a valid email' },
      { status: 400 },
    );
  }

  const finalEmail = buyerEmail || order.buyer_email;

  const ticketsRes = await pool.query(
    `
    select ticket_code
    from public.tickets
    where order_id = $1
      and voided_at is null
    order by created_at asc
    `,
    [order.id],
  );

  const tickets = ticketsRes.rows as { ticket_code: string }[];

  if (!tickets.length) {
    return NextResponse.json(
      { error: 'No active tickets found for this order' },
      { status: 400 },
    );
  }

  const { html, attachments } = await buildTicketsEmailPayload({
    venueKey,
    title: order.event_title ?? 'Event',
    startsAt: order.starts_at ?? null,
    endsAt: order.ends_at ?? null,
    buyerName: `${order.buyer_first_name} ${order.buyer_last_name}`.trim(),
    quantity: order.quantity,
    unitPriceCents: Number(order.unit_amount_cents ?? 0),
    currency: order.currency ?? 'cad',
    tickets,
  });

  await resend.emails.send({
    from: branding.from,
    to: finalEmail,
    subject: `Your tickets for ${order.event_title ?? branding.subjectFallback}`,
    html,
    attachments,
  });

  await pool.query(
    `
  update public.orders
  set
    buyer_email = $2,
    email_sent_at = coalesce(email_sent_at, now()),
    last_ticket_resent_at = now(),
    ticket_email_send_count = coalesce(ticket_email_send_count, 0) + 1,
    updated_at = now()
  where id = $1
  `,
    [order.id, finalEmail],
  );

  return NextResponse.json({
    ok: true,
    resent: true,
    order: {
      id: order.id,
      venue_key: venueKey,
      event_title: order.event_title,
      buyer_email: finalEmail,
    },
  });
}
