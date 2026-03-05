// src/lib/refunds/applyRefundToOrder.ts
import type { PoolClient } from 'pg';

type ApplyRefundInput = {
  orderId: string;
  reason: string;
  stripeRefundId?: string | null;
  refundedAmountCents?: number | null;
  stripePaymentIntentId?: string | null;
};

export async function applyRefundToOrder(
  client: PoolClient,
  input: ApplyRefundInput,
) {
  // Lock order row
  const orderRes = await client.query(
    `
    select
      id,
      status,
      quantity,
      ticket_type_id,
      stripe_checkout_session_id,
      stripe_payment_intent_id,
      stripe_refund_id
    from public.orders
    where id = $1
    limit 1
    for update
    `,
    [input.orderId],
  );

  if ((orderRes.rowCount ?? 0) === 0) {
    return { ok: false as const, error: 'Order not found' };
  }

  const order = orderRes.rows[0] as {
    id: string;
    status: string;
    quantity: number;
    ticket_type_id: string;
    stripe_checkout_session_id: string;
    stripe_payment_intent_id: string | null;
    stripe_refund_id: string | null;
  };

  // Idempotency: if already refunded, do nothing
  if (order.status === 'refunded') {
    return {
      ok: true as const,
      orderId: order.id,
      alreadyRefunded: true,
      voidedTickets: 0,
    };
  }

  // Void tickets (only those not already voided)
  const voidRes = await client.query(
    `
    with voided as (
      update public.tickets
      set voided_at = now(),
          void_reason = $2
      where order_id = $1
        and voided_at is null
      returning id
    )
    select count(*)::int as voided_count from voided
    `,
    [order.id, input.reason],
  );

  const voidedCount = Number(voidRes.rows[0]?.voided_count ?? 0);

  // Decrement sold_count based on how many we actually voided (safe + idempotent)
  if (voidedCount > 0) {
    await client.query(
      `
      update public.ticket_types
      set sold_count = greatest(0, sold_count - $1),
          updated_at = now()
      where id = $2
      `,
      [voidedCount, order.ticket_type_id],
    );
  }

  // Mark order refunded
  await client.query(
    `
    update public.orders
    set
      status = 'refunded',
      refunded_at = now(),
      refund_reason = $2,
      stripe_refund_id = coalesce($3, stripe_refund_id),
      refunded_amount_cents = coalesce($4, refunded_amount_cents),
      stripe_payment_intent_id = coalesce($5, stripe_payment_intent_id),
      updated_at = now()
    where id = $1
    `,
    [
      order.id,
      input.reason,
      input.stripeRefundId ?? null,
      input.refundedAmountCents ?? null,
      input.stripePaymentIntentId ?? null,
    ],
  );

  return {
    ok: true as const,
    orderId: order.id,
    alreadyRefunded: false,
    voidedTickets: voidedCount,
  };
}
