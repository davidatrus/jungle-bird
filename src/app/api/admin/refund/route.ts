// src/app/api/admin/refund/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { applyRefundToOrder } from '@/lib/refunds/applyRefundToOrder';
import type { VenueKey } from '@/lib/venueConfig';
import { getStripeClient, normalizeVenueKey } from '@/lib/stripe';

export const runtime = 'nodejs';

type Body = {
  orderId: string;
  reason?: string;
};

function getAuthToken(req: Request) {
  const h = req.headers.get('authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

export async function POST(req: Request) {
  const expected = process.env.ADMIN_REFUND_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: 'Missing ADMIN_REFUND_TOKEN env var' },
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

  const orderId = (body.orderId || '').trim();
  const reason = (body.reason || 'Admin refund').trim();

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('begin');

    const orderRes = await client.query(
      `
      select
        o.id,
        o.status,
        o.stripe_checkout_session_id,
        o.stripe_payment_intent_id,
        e.title as event_title,
        e.venue_key
      from public.orders o
      join public.events e on e.id = o.event_id
      where o.id = $1
      limit 1
      for update
      `,
      [orderId],
    );

    if ((orderRes.rowCount ?? 0) === 0) {
      await client.query('rollback');
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderRes.rows[0] as {
      id: string;
      status: string;
      stripe_checkout_session_id: string;
      stripe_payment_intent_id: string | null;
      event_title: string | null;
      venue_key: string | null;
    };

    const venueKey: VenueKey = normalizeVenueKey(order.venue_key);
    const stripe = getStripeClient(venueKey);

    if (order.status === 'refunded' || order.status === 'cancelled') {
      await client.query('commit');
      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: order.status,
        event_title: order.event_title,
        venue_key: venueKey,
        message: 'Order already refunded/cancelled',
      });
    }

    if (order.status !== 'paid') {
      await client.query('rollback');
      return NextResponse.json(
        {
          error: `Order status must be 'paid' to refund (got '${order.status}')`,
          event_title: order.event_title,
          venue_key: venueKey,
        },
        { status: 400 },
      );
    }

    let paymentIntentId = order.stripe_payment_intent_id;
    if (!paymentIntentId) {
      const session = await stripe.checkout.sessions.retrieve(
        order.stripe_checkout_session_id,
      );
      paymentIntentId = (session.payment_intent as string | null) ?? null;
    }

    if (!paymentIntentId) {
      await client.query('rollback');
      return NextResponse.json(
        {
          error: 'Missing Stripe payment_intent_id (cannot refund)',
          event_title: order.event_title,
          venue_key: venueKey,
        },
        { status: 400 },
      );
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        order_id: order.id,
        venue_key: venueKey,
        reason,
      },
    });

    const applied = await applyRefundToOrder(client, {
      orderId: order.id,
      reason,
      stripeRefundId: refund.id,
      refundedAmountCents: refund.amount ?? null,
      stripePaymentIntentId: paymentIntentId,
    });

    await client.query('commit');

    if (!applied.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: applied.error,
          event_title: order.event_title,
          venue_key: venueKey,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      event_title: order.event_title,
      venue_key: venueKey,
      stripe_refund_id: refund.id,
      voided_tickets: applied.voidedTickets,
      refunded_amount_cents: refund.amount ?? null,
    });
  } catch (err) {
    try {
      await client.query('rollback');
    } catch {}
    console.error('Refund failed:', err);
    return NextResponse.json({ error: 'Refund failed' }, { status: 500 });
  } finally {
    client.release();
  }
}
