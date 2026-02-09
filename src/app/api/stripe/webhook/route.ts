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

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig)
    return new NextResponse('Missing Stripe signature', { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  let evt: Stripe.Event;

  try {
    const body = await req.text();
    evt = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

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

  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    return new NextResponse('Invalid quantity', { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    // Guard: if order exists and email already sent, exit cleanly.
    const existingOrderRes = await client.query(
      `
      select id, email_sent_at
      from public.orders
      where stripe_checkout_session_id = $1
      limit 1
      `,
      [session.id],
    );

    if (existingOrderRes.rows[0]?.email_sent_at) {
      await client.query('commit');
      return NextResponse.json({
        received: true,
        skipped: 'email already sent',
      });
    }

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
      returning id, email_sent_at, (xmax = 0) as inserted
      `,
      [
        event_id,
        ticket_type_id,
        buyer_first_name,
        buyer_last_name,
        buyer_email,
        qty,
        Number(unit_amount_cents ?? 0),
        Number(subtotal_cents ?? 0),
        session.amount_total ?? Number(subtotal_cents ?? 0),
        session.id,
        (session.payment_intent as string) ?? null,
      ],
    );

    const orderId = orderRes.rows[0].id as string;
    const emailSentAt = orderRes.rows[0].email_sent_at as string | null;
    const inserted = Boolean(orderRes.rows[0].inserted);

    if (inserted) {
      for (let i = 0; i < qty; i++) {
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
        [qty, ticket_type_id],
      );
    }

    await client.query('commit');

    // If already emailed, stop here
    if (emailSentAt) {
      return NextResponse.json({ received: true });
    }

    // Fetch details
    const eventInfoRes = await client.query(
      `select title, starts_at, ends_at from public.events where id = $1 limit 1`,
      [event_id],
    );

    const ticketsRes = await client.query(
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
      quantity: qty,
      unitPriceCents: Number(unit_amount_cents ?? 0),
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

    await client.query(
      `update public.orders set email_sent_at = now() where id = $1`,
      [orderId],
    );

    return NextResponse.json({ received: true });
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
