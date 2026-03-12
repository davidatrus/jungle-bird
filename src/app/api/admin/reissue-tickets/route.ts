import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { buildTicketsEmailPayload } from '@/lib/ticketsEmail';
import { Resend } from 'resend';
import type { VenueKey } from '@/lib/venueConfig';
import crypto from 'crypto';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY as string);

type Body = {
  action: 'lookup' | 'reissue';
  orderId?: string;
  sessionId?: string;
  buyerEmail?: string;
  reason?: string;
  adminLabel?: string;
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

function generateTicketCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

async function findOrder(input: { orderId?: string; sessionId?: string }) {
  if (input.orderId) {
    const res = await pool.query(
      `
      select
        o.id,
        o.status,
        o.event_id,
        o.ticket_type_id,
        o.buyer_first_name,
        o.buyer_last_name,
        o.buyer_email,
        o.quantity,
        o.unit_amount_cents,
        o.currency,
        o.email_sent_at,
        o.last_ticket_resent_at,
        o.ticket_email_send_count,
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
        o.event_id,
        o.ticket_type_id,
        o.buyer_first_name,
        o.buyer_last_name,
        o.buyer_email,
        o.quantity,
        o.unit_amount_cents,
        o.currency,
        o.email_sent_at,
        o.last_ticket_resent_at,
        o.ticket_email_send_count,
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

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = body.action;
  const orderId = (body.orderId || '').trim();
  const sessionId = (body.sessionId || '').trim();
  const buyerEmail = (body.buyerEmail || '').trim().toLowerCase();
  const reason = (body.reason || 'Admin ticket reissue').trim();
  const adminLabel = (body.adminLabel || 'admin-scan-page').trim();

  if (!action || !['lookup', 'reissue'].includes(action)) {
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
    event_id: string;
    ticket_type_id: string;
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
        error: `Only paid orders can reissue tickets (got '${order.status}')`,
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
  const branding = getVenueEmailBranding(venueKey);

  const client = await pool.connect();
  try {
    await client.query('begin');

    const currentTicketsRes = await client.query(
      `
      select
        id,
        ticket_code,
        checked_in_at,
        voided_at
      from public.tickets
      where order_id = $1
        and voided_at is null
      order by created_at asc
      for update
      `,
      [order.id],
    );

    const currentTickets = currentTicketsRes.rows as Array<{
      id: string;
      ticket_code: string;
      checked_in_at: string | null;
      voided_at: string | null;
    }>;

    if (!currentTickets.length) {
      await client.query('rollback');
      return NextResponse.json(
        { error: 'No active tickets found for this order' },
        { status: 400 },
      );
    }

    const checkedInCount = currentTickets.filter(
      (t) => !!t.checked_in_at,
    ).length;
    if (checkedInCount > 0) {
      await client.query('rollback');
      return NextResponse.json(
        {
          error:
            'Cannot reissue tickets after any ticket on this order has been checked in',
        },
        { status: 400 },
      );
    }

    await client.query(
      `
      update public.tickets
      set
        voided_at = now(),
        void_reason = $2
      where order_id = $1
        and voided_at is null
      `,
      [order.id, `Reissued: ${reason}`],
    );

    const newTicketIds: Array<{ id: string; ticket_code: string }> = [];
    for (let i = 0; i < currentTickets.length; i++) {
      const insertRes = await client.query(
        `
        insert into public.tickets (
          order_id,
          event_id,
          ticket_type_id,
          ticket_code
        )
        values ($1, $2, $3, $4)
        returning id, ticket_code
        `,
        [order.id, order.event_id, order.ticket_type_id, generateTicketCode()],
      );

      newTicketIds.push(
        insertRes.rows[0] as { id: string; ticket_code: string },
      );
    }

    for (let i = 0; i < currentTickets.length; i++) {
      await client.query(
        `
        insert into public.ticket_reissues (
          order_id,
          old_ticket_id,
          new_ticket_id,
          reason,
          reissued_to_email,
          admin_label
        )
        values ($1, $2, $3, $4, $5, $6)
        `,
        [
          order.id,
          currentTickets[i].id,
          newTicketIds[i].id,
          reason,
          finalEmail,
          adminLabel,
        ],
      );
    }

    await client.query(
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

    await client.query('commit');

    const { html, attachments } = await buildTicketsEmailPayload({
      venueKey,
      title: order.event_title ?? 'Event',
      startsAt: order.starts_at ?? null,
      endsAt: order.ends_at ?? null,
      buyerName: `${order.buyer_first_name} ${order.buyer_last_name}`.trim(),
      quantity: order.quantity,
      unitPriceCents: Number(order.unit_amount_cents ?? 0),
      currency: order.currency ?? 'cad',
      tickets: newTicketIds.map((t) => ({ ticket_code: t.ticket_code })),
    });

    await resend.emails.send({
      from: branding.from,
      to: finalEmail,
      subject: `Your reissued tickets for ${order.event_title ?? branding.subjectFallback}`,
      html,
      attachments,
    });

    return NextResponse.json({
      ok: true,
      reissued: true,
      order: {
        id: order.id,
        venue_key: venueKey,
        event_title: order.event_title,
        buyer_email: finalEmail,
        new_ticket_count: newTicketIds.length,
      },
    });
  } catch (err) {
    try {
      await client.query('rollback');
    } catch {}
    console.error('Ticket reissue failed:', err);
    return NextResponse.json(
      { error: 'Ticket reissue failed' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
