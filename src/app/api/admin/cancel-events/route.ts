// src/app/api/admin/cancel-events/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { pool } from '@/lib/db';
import { Resend } from 'resend';
import { applyRefundToOrder } from '@/lib/refunds/applyRefundToOrder';
import type { VenueKey } from '@/lib/venueConfig';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

type Body = {
  eventId?: string; // public.events.id (uuid)
  sanityEventId?: string; // public.events.sanity_event_id (text)
  reason?: string;
  dryRun?: boolean;
  cancelEvenIfRefundsFail?: boolean;
};

function normalizeVenueKey(value: string | null | undefined): VenueKey {
  return value === 'prohibition' ? 'prohibition' : 'jungle_bird';
}

function getVenueEmailBranding(venueKey: VenueKey) {
  if (venueKey === 'prohibition') {
    return {
      from: 'Prohibition Tickets <tickets@junglebirdtikiyyc.com>',
      signoff: 'Prohibition',
    };
  }

  return {
    from: 'Jungle Bird Tickets <tickets@junglebirdtikiyyc.com>',
    signoff: 'Jungle Bird',
  };
}

function getAllowedOrigin() {
  return (process.env.SANITY_STUDIO_ORIGIN || 'http://localhost:3333').replace(
    /\/+$/,
    '',
  );
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error';
  }
}

function json(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status,
    headers: corsHeaders(),
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function getAuthToken(req: Request) {
  const h = req.headers.get('authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

export async function POST(req: Request) {
  const expected = process.env.ADMIN_CANCEL_EVENT_TOKEN;
  if (!expected) {
    return json(
      { error: 'Missing ADMIN_CANCEL_EVENT_TOKEN env var' },
      { status: 500 },
    );
  }

  const token = getAuthToken(req);
  if (!token || token !== expected) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const reason = (body.reason || 'Event cancelled').trim();
  const dryRun = Boolean(body.dryRun);
  const cancelEvenIfRefundsFail =
    body.cancelEvenIfRefundsFail === undefined
      ? true
      : Boolean(body.cancelEvenIfRefundsFail);

  const eventId = (body.eventId || '').trim();
  const sanityEventId = (body.sanityEventId || '').trim();

  if (!eventId && !sanityEventId) {
    return json({ error: 'Provide eventId or sanityEventId' }, { status: 400 });
  }

  const startedAt = Date.now();
  const client = await pool.connect();

  let ev: {
    id: string;
    sanity_event_id: string;
    title: string;
    starts_at: string;
    status: string;
    venue_key: string | null;
  };

  let paidOrders: Array<{
    id: string;
    buyer_email: string;
    buyer_first_name: string;
    buyer_last_name: string;
    stripe_checkout_session_id: string;
    stripe_payment_intent_id: string | null;
    status: string;
  }> = [];

  try {
    await client.query('begin');

    const evRes = await client.query(
      `
      select id, sanity_event_id, title, starts_at, status, venue_key
      from public.events
      where ${eventId ? 'id = $1' : 'sanity_event_id = $1'}
      limit 1
      for update
      `,
      [eventId || sanityEventId],
    );

    if ((evRes.rowCount ?? 0) === 0) {
      await client.query('rollback');
      return json({ error: 'Event not found' }, { status: 404 });
    }

    ev = evRes.rows[0];

    const ordersRes = await client.query(
      `
      select
        id,
        buyer_email,
        buyer_first_name,
        buyer_last_name,
        stripe_checkout_session_id,
        stripe_payment_intent_id,
        status
      from public.orders
      where event_id = $1
        and status = 'paid'
      for update
      `,
      [ev.id],
    );

    paidOrders = ordersRes.rows;

    if (dryRun) {
      await client.query('rollback');
      return json({
        ok: true,
        dryRun: true,
        event: {
          id: ev.id,
          title: ev.title,
          status: ev.status,
          venue_key: ev.venue_key,
        },
        wouldRefundOrders: paidOrders.map((o) => o.id),
      });
    }

    if (ev.status !== 'cancelled') {
      await client.query(
        `update public.events set status = 'cancelled', updated_at = now() where id = $1`,
        [ev.id],
      );
      ev.status = 'cancelled';
    }

    await client.query('commit');
  } catch (err: unknown) {
    try {
      await client.query('rollback');
    } catch {}
    console.error('Cancel-events preflight failed:', err);
    return json(
      { ok: false, error: getErrorMessage(err) || 'Cancel event failed' },
      { status: 500 },
    );
  } finally {
    client.release();
  }

  const venueKey = normalizeVenueKey(ev.venue_key);
  const branding = getVenueEmailBranding(venueKey);

  const results: Array<{
    orderId: string;
    refunded: boolean;
    stripeRefundId?: string;
    emailSent?: boolean;
    error?: string;
  }> = [];

  for (const o of paidOrders) {
    try {
      let paymentIntentId = o.stripe_payment_intent_id;

      if (!paymentIntentId) {
        const session = await stripe.checkout.sessions.retrieve(
          o.stripe_checkout_session_id,
        );
        paymentIntentId = (session.payment_intent as string | null) ?? null;
      }

      if (!paymentIntentId) {
        results.push({
          orderId: o.id,
          refunded: false,
          error: 'Missing payment_intent_id',
        });
        continue;
      }

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          order_id: o.id,
          event_id: ev.id,
          venue_key: venueKey,
          reason: 'event_cancelled',
        },
      });

      const c2 = await pool.connect();
      try {
        await c2.query('begin');

        const applied = await applyRefundToOrder(c2, {
          orderId: o.id,
          reason: `Event cancelled: ${reason}`,
          stripeRefundId: refund.id,
          refundedAmountCents: refund.amount ?? null,
          stripePaymentIntentId: paymentIntentId,
        });

        if (!applied.ok) {
          await c2.query('rollback');
          results.push({
            orderId: o.id,
            refunded: false,
            stripeRefundId: refund.id,
            error: applied.error ?? 'Failed to apply refund in DB',
          });
          continue;
        }

        await c2.query('commit');
      } catch (e: unknown) {
        try {
          await c2.query('rollback');
        } catch {}
        results.push({
          orderId: o.id,
          refunded: false,
          stripeRefundId: refund.id,
          error: getErrorMessage(e) || 'DB applyRefundToOrder failed',
        });
        continue;
      } finally {
        c2.release();
      }

      let emailSent = false;
      try {
        const buyerName = `${o.buyer_first_name} ${o.buyer_last_name}`.trim();

        await resend.emails.send({
          from: branding.from,
          to: o.buyer_email,
          subject: `Event cancelled: ${ev.title} (Refund started)`,
          html: `
            <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.5;">
              <h2 style="margin:0 0 12px;">${ev.title} has been cancelled</h2>
              <p style="margin:0 0 12px;">Hi ${buyerName || 'there'},</p>
              <p style="margin:0 0 12px;">
                Unfortunately, this event has been cancelled. We have started your refund.
                Depending on your bank, it may take a few business days to appear on your statement.
              </p>
              <p style="margin:0 0 12px; color:#666;">
                Refund reference: ${refund.id}
              </p>
              <p style="margin:0;">Thanks,<br/>${branding.signoff}</p>
            </div>
          `,
        });

        emailSent = true;
      } catch (e: unknown) {
        console.error('Cancel-events refund email failed:', e);
      }

      results.push({
        orderId: o.id,
        refunded: true,
        stripeRefundId: refund.id,
        emailSent,
      });
    } catch (e: unknown) {
      results.push({
        orderId: o.id,
        refunded: false,
        error: getErrorMessage(e) || 'Refund failed',
      });
    }
  }

  const failures = results.filter((r) => !r.refunded).length;

  if (!cancelEvenIfRefundsFail && failures > 0) {
    try {
      await pool.query(
        `update public.events set status = 'on_sale', updated_at = now() where id = $1 and status = 'cancelled'`,
        [ev.id],
      );
    } catch (e: unknown) {
      console.error('Failed to revert event status after partial failures:', e);
    }
  }

  return json({
    ok: failures === 0,
    ms: Date.now() - startedAt,
    event: {
      id: ev.id,
      title: ev.title,
      status: ev.status,
      venue_key: ev.venue_key,
    },
    paidOrdersFound: paidOrders.length,
    refundedCount: results.filter((r) => r.refunded).length,
    failedCount: failures,
    results,
  });
}
