// src/app/api/admin/refund/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { pool } from '@/lib/db';
import { applyRefundToOrder } from '@/lib/refunds/applyRefundToOrder';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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

    // Lock order row to read details needed for Stripe refund
    const orderRes = await client.query(
      `
      select
        id,
        status,
        stripe_checkout_session_id,
        stripe_payment_intent_id
      from public.orders
      where id = $1
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
    };

    // Idempotent exit if already refunded/cancelled
    if (order.status === 'refunded' || order.status === 'cancelled') {
      await client.query('commit');
      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: order.status,
        message: 'Order already refunded/cancelled',
      });
    }

    if (order.status !== 'paid') {
      await client.query('rollback');
      return NextResponse.json(
        {
          error: `Order status must be 'paid' to refund (got '${order.status}')`,
        },
        { status: 400 },
      );
    }

    // Determine PaymentIntent
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
        { error: 'Missing Stripe payment_intent_id (cannot refund)' },
        { status: 400 },
      );
    }

    // Refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: { order_id: order.id, reason },
    });

    // Apply refund consistently in DB (void tickets, sold_count, etc.)
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
        { ok: false, error: applied.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
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
