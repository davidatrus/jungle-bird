// src/lib/refunds/refundWorker.ts
import type { PoolClient } from 'pg';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { applyRefundToOrder } from '@/lib/refunds/applyRefundToOrder';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

type WorkerOptions = {
  maxItems?: number; // per run
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Refund failed';
  }
}

export async function processRefundQueue(
  client: PoolClient,
  opts: WorkerOptions = {},
) {
  const maxItems = Math.max(1, Math.min(100, opts.maxItems ?? 25));
  const startedAt = Date.now();

  // 1) Pick ONE run to work on (queued first, otherwise running)
  const runRes = await client.query(
    `
    select id, event_id, sanity_event_id, status
    from public.refund_runs
    where status in ('queued','running')
    order by
      case status when 'queued' then 0 else 1 end,
      created_at asc
    limit 1
    for update
    `,
  );

  if ((runRes.rowCount ?? 0) === 0) {
    return {
      ok: true,
      worked: false,
      message: 'No queued/running refund_runs',
      ms: Date.now() - startedAt,
    };
  }

  const run = runRes.rows[0] as {
    id: string;
    event_id: string;
    sanity_event_id: string | null;
    status: string;
  };

  // Mark it running
  if (run.status !== 'running') {
    await client.query(
      `update public.refund_runs set status='running', updated_at=now() where id=$1`,
      [run.id],
    );
  }

  // 2) Grab a batch of queued/failed items for this run (skip refunded/skipped)
  const itemsRes = await client.query(
    `
    select
      rri.id,
      rri.order_id,
      rri.status,
      o.buyer_email,
      o.buyer_first_name,
      o.buyer_last_name,
      o.stripe_checkout_session_id,
      o.stripe_payment_intent_id,
      o.total_cents,
      e.title as event_title
    from public.refund_run_items rri
    join public.orders o on o.id = rri.order_id
    join public.events e on e.id = o.event_id
    where rri.refund_run_id = $1
      and rri.status in ('queued','failed')
    order by rri.created_at asc
    limit $2
    for update
    `,
    [run.id, maxItems],
  );

  const items = itemsRes.rows as Array<{
    id: string;
    order_id: string;
    status: string;
    buyer_email: string;
    buyer_first_name: string;
    buyer_last_name: string;
    stripe_checkout_session_id: string;
    stripe_payment_intent_id: string | null;
    total_cents: number;
    event_title: string;
  }>;

  if (!items.length) {
    // Nothing left to do => complete run
    await client.query(
      `update public.refund_runs set status='completed', updated_at=now() where id=$1`,
      [run.id],
    );
    return {
      ok: true,
      worked: true,
      runId: run.id,
      processed: 0,
      completed: true,
      ms: Date.now() - startedAt,
    };
  }

  let refunded = 0;
  let failed = 0;
  let skipped = 0;

  for (const item of items) {
    try {
      // Re-check order status for safety
      const stRes = await client.query(
        `select status from public.orders where id=$1 limit 1`,
        [item.order_id],
      );
      const orderStatus = (stRes.rows[0]?.status as string | undefined) ?? '';

      if (orderStatus === 'refunded' || orderStatus === 'cancelled') {
        await client.query(
          `update public.refund_run_items set status='skipped', error_message='Order already refunded/cancelled', updated_at=now() where id=$1`,
          [item.id],
        );
        skipped += 1;
        continue;
      }

      if (orderStatus !== 'paid') {
        await client.query(
          `update public.refund_run_items set status='skipped', error_message=$2, updated_at=now() where id=$1`,
          [item.id, `Order status is '${orderStatus}', not refundable here`],
        );
        skipped += 1;
        continue;
      }

      // Determine PaymentIntent
      let paymentIntentId = item.stripe_payment_intent_id;
      if (!paymentIntentId) {
        const session = await stripe.checkout.sessions.retrieve(
          item.stripe_checkout_session_id,
        );
        paymentIntentId = (session.payment_intent as string | null) ?? null;
      }
      if (!paymentIntentId) throw new Error('Missing payment_intent_id');

      // Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          order_id: item.order_id,
          refund_run_id: run.id,
          reason: 'event_cancelled',
        },
      });

      // Apply to DB (void tickets, decrement sold_count, mark order refunded)
      await applyRefundToOrder(client, {
        orderId: item.order_id,
        reason: 'Event cancelled',
        stripeRefundId: refund.id,
        refundedAmountCents: refund.amount ?? null,
        stripePaymentIntentId: paymentIntentId,
      });

      // Mark item refunded
      await client.query(
        `
        update public.refund_run_items
        set
          status='refunded',
          stripe_payment_intent_id=$2,
          stripe_refund_id=$3,
          refund_amount_cents=$4,
          error_message=null,
          updated_at=now()
        where id=$1
        `,
        [item.id, paymentIntentId, refund.id, refund.amount ?? null],
      );

      refunded += 1;

      // Email (after DB is consistent)
      const from = 'Jungle Bird Tickets <tickets@junglebirdtikiyyc.com>';
      const buyerName =
        `${item.buyer_first_name} ${item.buyer_last_name}`.trim();

      await resend.emails.send({
        from,
        to: item.buyer_email,
        subject: `Event cancelled: ${item.event_title} (Refund started)`,
        html: `
          <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.5;">
            <h2 style="margin:0 0 12px;">${item.event_title} has been cancelled</h2>
            <p style="margin:0 0 12px;">Hi ${buyerName || 'there'},</p>
            <p style="margin:0 0 12px;">
              Unfortunately, this event has been cancelled. We have started your refund.
              Depending on your bank, it may take a few business days to appear.
            </p>
            <p style="margin:0 0 12px; color:#666;">Refund reference: ${refund.id}</p>
            <p style="margin:0;">Thanks,<br/>Jungle Bird</p>
          </div>
        `,
      });

      // Optional: track email idempotency (recommended)
      await client.query(
        `update public.orders set cancel_email_sent_at = coalesce(cancel_email_sent_at, now()), updated_at=now() where id=$1`,
        [item.order_id],
      );
    } catch (e: unknown) {
      failed += 1;
      const msg = getErrorMessage(e);

      await client.query(
        `
        update public.refund_run_items
        set status='failed',
            error_message=$2,
            updated_at=now()
        where id=$1
        `,
        [item.id, msg],
      );
    }
  }

  // 3) If there are still queued/failed items, leave run as running, else complete
  const remainingRes = await client.query(
    `
    select count(*)::int as c
    from public.refund_run_items
    where refund_run_id=$1
      and status in ('queued','failed')
    `,
    [run.id],
  );

  const remaining = Number(remainingRes.rows[0]?.c ?? 0);
  if (remaining === 0) {
    await client.query(
      `update public.refund_runs set status='completed', updated_at=now() where id=$1`,
      [run.id],
    );
  }

  return {
    ok: true,
    worked: true,
    runId: run.id,
    processed: items.length,
    refunded,
    failed,
    skipped,
    remaining,
    completed: remaining === 0,
    ms: Date.now() - startedAt,
  };
}
