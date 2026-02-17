// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { pool } from '@/lib/db';
import crypto from 'crypto';
import { Resend } from 'resend';
import { buildTicketsEmailPayload } from '@/lib/ticketsEmail';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

function generateTicketCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

function num(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig)
    return new NextResponse('Missing Stripe signature', { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret)
    return new NextResponse('Webhook secret not configured', { status: 500 });

  let evt: Stripe.Event;
  try {
    const body = await req.text();
    evt = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // ---- Handle session expired (release holds) ----
  if (evt.type === 'checkout.session.expired') {
    const session = evt.data.object as Stripe.Checkout.Session;
    try {
      await pool.query(
        `
        update public.inventory_holds
        set status = 'released'
        where stripe_checkout_session_id = $1
          and status = 'active'
        `,
        [session.id],
      );
    } catch (err) {
      console.error('Failed to release hold for expired session:', err);
    }
    return NextResponse.json({ received: true });
  }

  // Only handle completed for now
  if (evt.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = evt.data.object as Stripe.Checkout.Session;
  const md = session.metadata;

  if (!md) {
    console.error('Missing metadata on checkout session');
    return new NextResponse('Missing metadata', { status: 400 });
  }

  const {
    event_id,
    ticket_type_id,
    buyer_first_name,
    buyer_last_name,
    buyer_email,
    quantity,
    unit_amount_cents,
    subtotal_cents,
  } = md;

  if (
    !event_id ||
    !ticket_type_id ||
    !buyer_first_name ||
    !buyer_last_name ||
    !buyer_email ||
    !quantity
  ) {
    console.error('Incomplete metadata', md);
    return new NextResponse('Invalid metadata', { status: 400 });
  }

  const qty = num(quantity, 0);
  if (!Number.isFinite(qty) || qty <= 0)
    return new NextResponse('Invalid quantity', { status: 400 });

  const client = await pool.connect();

  try {
    await client.query('begin');

    // Existing order (idempotency)
    const existingOrderRes = await client.query(
      `
      select id, email_sent_at, status
      from public.orders
      where stripe_checkout_session_id = $1
      limit 1
      `,
      [session.id],
    );

    const existingOrder = existingOrderRes.rows[0] as
      | { id: string; email_sent_at: string | null; status: string }
      | undefined;

    // Lock the hold row (if it exists)
    const holdRes = await client.query(
      `
      select id, qty, status, expires_at
      from public.inventory_holds
      where stripe_checkout_session_id = $1
      limit 1
      for update
      `,
      [session.id],
    );

    const hold = holdRes.rows[0] as
      | { id: string; qty: number; status: string; expires_at: string }
      | undefined;

    const holdId = hold?.id;
    const holdQty = typeof hold?.qty === 'number' ? hold.qty : undefined;
    const holdStatus = hold?.status;
    const holdExpiresAt = hold?.expires_at ? new Date(hold.expires_at) : null;

    if (holdId && typeof holdQty === 'number' && holdQty !== qty) {
      console.warn(
        `Hold qty mismatch for session ${session.id}: metadata=${qty}, hold=${holdQty}. Using hold qty.`,
      );
    }

    const effectiveQty = holdId && typeof holdQty === 'number' ? holdQty : qty;

    const isLatePayment =
      !holdId ||
      holdStatus !== 'active' ||
      (holdExpiresAt ? holdExpiresAt.getTime() <= Date.now() : true);

    // If already emailed, just ensure hold is converted if it was active and exit
    if (existingOrder?.email_sent_at) {
      if (holdId && holdStatus === 'active') {
        await client.query(
          `update public.inventory_holds set status = 'converted' where id = $1`,
          [holdId],
        );
      }
      await client.query('commit');
      return NextResponse.json({
        received: true,
        skipped: 'email already sent',
      });
    }

    // If payment is late, re-check capacity at webhook-time (lock ticket_types row)
    if (isLatePayment) {
      const ttRes = await client.query(
        `
        select id, capacity, sold_count
        from public.ticket_types
        where id = $1
        limit 1
        for update
        `,
        [ticket_type_id],
      );

      if (ttRes.rowCount === 0) {
        await client.query('rollback');
        console.error(
          `Late payment but ticket_type not found: ${ticket_type_id}`,
        );
        return NextResponse.json({ received: true });
      }

      const tt = ttRes.rows[0] as {
        id: string;
        capacity: number;
        sold_count: number;
      };

      const heldRes = await client.query(
        `
        select coalesce(sum(qty), 0)::int as held_active
        from public.inventory_holds
        where ticket_type_id = $1
          and status = 'active'
          and expires_at > now()
        `,
        [ticket_type_id],
      );

      const heldActive = Number(heldRes.rows[0]?.held_active ?? 0);
      const remaining =
        Number(tt.capacity) - Number(tt.sold_count) - heldActive;

      if (effectiveQty > remaining) {
        console.warn(
          `Late payment oversold: session=${session.id} qty=${effectiveQty} remaining=${remaining}. Marking order failed.`,
        );

        // Record/update an order row so you can reconcile/refund manually later
        await client.query(
          `
          insert into public.orders (
            event_id,
            ticket_type_id,
            status,
            buyer_first_name,
            buyer_last_name,
            buyer_email,
            quantity,
            currency,
            unit_amount_cents,
            subtotal_cents,
            fees_cents,
            total_cents,
            stripe_checkout_session_id,
            stripe_payment_intent_id
          ) values (
            $1, $2, 'failed',
            $3, $4, $5,
            $6, 'cad',
            $7, $8, 0, $9,
            $10, $11
          )
          on conflict (stripe_checkout_session_id)
          do update set
            status = 'failed',
            updated_at = now()
          `,
          [
            event_id,
            ticket_type_id,
            buyer_first_name,
            buyer_last_name,
            buyer_email,
            effectiveQty,
            num(unit_amount_cents, 0),
            num(subtotal_cents, 0),
            session.amount_total ?? num(subtotal_cents, 0),
            session.id,
            (session.payment_intent as string) ?? null,
          ],
        );

        await client.query('commit');
        // Acknowledge webhook to stop retries
        return NextResponse.json({
          received: true,
          late_payment: true,
          allocated: false,
        });
      }
    }

    // Create/update order as PAID (normal path + late-payment-success path)
    const orderRes = await client.query(
      `
      insert into public.orders (
        event_id,
        ticket_type_id,
        status,
        buyer_first_name,
        buyer_last_name,
        buyer_email,
        quantity,
        currency,
        unit_amount_cents,
        subtotal_cents,
        fees_cents,
        total_cents,
        stripe_checkout_session_id,
        stripe_payment_intent_id
      ) values (
        $1, $2, 'paid',
        $3, $4, $5,
        $6, 'cad',
        $7, $8, 0, $9,
        $10, $11
      )
      on conflict (stripe_checkout_session_id)
      do update set updated_at = now()
      returning id, email_sent_at
      `,
      [
        event_id,
        ticket_type_id,
        buyer_first_name,
        buyer_last_name,
        buyer_email,
        effectiveQty,
        num(unit_amount_cents, 0),
        num(subtotal_cents, 0),
        session.amount_total ?? num(subtotal_cents, 0),
        session.id,
        (session.payment_intent as string) ?? null,
      ],
    );

    const orderId = orderRes.rows[0].id as string;
    const emailSentAt = orderRes.rows[0].email_sent_at as string | null;

    // Mint missing tickets if needed (handles partial failures/idempotency)
    const ticketCountRes = await client.query(
      `select count(*)::int as c from public.tickets where order_id = $1`,
      [orderId],
    );
    const alreadyMinted = Number(ticketCountRes.rows[0]?.c ?? 0);
    const missing = Math.max(0, effectiveQty - alreadyMinted);

    if (missing > 0) {
      for (let i = 0; i < missing; i++) {
        await client.query(
          `
          insert into public.tickets (
            order_id,
            event_id,
            ticket_type_id,
            ticket_code
          ) values ($1, $2, $3, $4)
          `,
          [orderId, event_id, ticket_type_id, generateTicketCode()],
        );
      }

      await client.query(
        `
        update public.ticket_types
        set sold_count = sold_count + $1
        where id = $2
        `,
        [missing, ticket_type_id],
      );
    }

    // Convert hold if it exists and is still active
    if (holdId && holdStatus === 'active') {
      await client.query(
        `update public.inventory_holds set status = 'converted' where id = $1`,
        [holdId],
      );
    } else if (!holdId) {
      console.warn(
        `No inventory_holds row found for completed session ${session.id} (late_payment=${isLatePayment})`,
      );
    }

    await client.query('commit');

    // If already emailed, stop here
    if (emailSentAt) return NextResponse.json({ received: true });

    // Fetch details for email
    const eventInfoRes = await pool.query(
      `select title, starts_at, ends_at from public.events where id = $1 limit 1`,
      [event_id],
    );

    const ticketsRes = await pool.query(
      `select ticket_code from public.tickets where order_id = $1 order by created_at asc`,
      [orderId],
    );

    const eventInfo = eventInfoRes.rows[0];
    const tickets = ticketsRes.rows as { ticket_code: string }[];

    const { html, attachments } = await buildTicketsEmailPayload({
      title: eventInfo?.title ?? 'Event',
      startsAt: eventInfo?.starts_at ?? null,
      endsAt: eventInfo?.ends_at ?? null,
      buyerName: `${buyer_first_name} ${buyer_last_name}`,
      quantity: effectiveQty,
      unitPriceCents: num(unit_amount_cents, 0),
      currency: 'cad',
      tickets,
    });

    const from = 'Jungle Bird Tickets <tickets@junglebirdtikiyyc.com>';

    await resend.emails.send({
      from,
      to: buyer_email,
      subject: `Your tickets for ${eventInfo?.title ?? 'Jungle Bird Event'}`,
      html,
      attachments,
    });

    await pool.query(
      `update public.orders set email_sent_at = now() where id = $1`,
      [orderId],
    );

    return NextResponse.json({ received: true, late_payment: isLatePayment });
  } catch (err) {
    try {
      await client.query('rollback');
    } catch {}
    console.error('Webhook processing failed:', err);
    return new NextResponse('Webhook error', { status: 500 });
  } finally {
    client.release();
  }
}
