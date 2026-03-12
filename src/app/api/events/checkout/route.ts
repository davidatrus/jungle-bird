// src/app/api/events/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { pool } from '@/lib/db';
import type { VenueKey } from '@/lib/venueConfig';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type CheckoutBody = {
  sanityEventId: string;
  sanityTicketTypeId: string;
  quantity: number;
  buyerFirstName: string;
  buyerLastName: string;
  buyerEmail: string;
};

const BLOCKED_EMAIL_DOMAINS = new Set([
  'gmal.com',
  'gmail.con',
  'gnail.com',
  'gmai.com',
  'hotnail.com',
  'hotmai.com',
  'outlok.com',
  'outloo.com',
  'yaho.com',
  'iclod.com',
]);

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getVenueBasePath(venueKey: string | null | undefined) {
  return venueKey === 'prohibition' ? '/prohibition' : '';
}

const HOLD_TTL_MINUTES = 15;

export async function POST(req: Request) {
  try {
    const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!publishable || !secret) {
      return NextResponse.json(
        { error: 'Stripe is not configured.' },
        { status: 500 },
      );
    }

    const body = (await req.json()) as Partial<CheckoutBody>;

    const sanityEventId = (body.sanityEventId ?? '').trim();
    const sanityTicketTypeId = (body.sanityTicketTypeId ?? '').trim();
    const quantity = Number(body.quantity ?? 0);
    const buyerFirstName = (body.buyerFirstName ?? '').trim();
    const buyerLastName = (body.buyerLastName ?? '').trim();
    const buyerEmail = normalizeEmail(body.buyerEmail ?? '');

    if (!sanityEventId) {
      return NextResponse.json(
        { error: 'Missing sanityEventId.' },
        { status: 400 },
      );
    }

    if (!sanityTicketTypeId) {
      return NextResponse.json(
        { error: 'Missing sanityTicketTypeId.' },
        { status: 400 },
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid quantity.' }, { status: 400 });
    }

    if (!buyerFirstName || !buyerLastName) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    if (!buyerEmail || !isEmail(buyerEmail)) {
      return NextResponse.json(
        { error: 'Valid email is required.' },
        { status: 400 },
      );
    }

    const emailDomain = buyerEmail.split('@')[1] || '';
    if (BLOCKED_EMAIL_DOMAINS.has(emailDomain)) {
      return NextResponse.json(
        { error: 'Please double-check your email domain for a typo.' },
        { status: 400 },
      );
    }

    const origin = req.headers.get('origin');
    if (!origin) {
      return NextResponse.json(
        { error: 'Missing Origin header.' },
        { status: 400 },
      );
    }

    const client = await pool.connect();
    try {
      await client.query('begin');

      const eventRes = await client.query(
        `
        select
          e.id as event_id,
          e.title,
          e.sanity_slug,
          e.venue_key,
          e.status,
          e.starts_at,
          tt.id as ticket_type_id,
          tt.name as ticket_name,
          tt.currency,
          tt.unit_amount_cents,
          tt.capacity,
          tt.sold_count,
          tt.min_per_order,
          tt.max_per_order,
          tt.sales_end_at
        from public.events e
        join public.ticket_types tt on tt.event_id = e.id
        where e.sanity_event_id = $1
          and tt.sanity_ticket_type_id = $2
        limit 1
        for update of tt
        `,
        [sanityEventId, sanityTicketTypeId],
      );

      if (eventRes.rowCount === 0) {
        await client.query('rollback');
        return NextResponse.json(
          { error: 'Event not found in DB yet. Add it first.' },
          { status: 404 },
        );
      }

      const row = eventRes.rows[0] as {
        event_id: string;
        title: string;
        sanity_slug: string;
        venue_key: VenueKey | string | null;
        status: string;
        starts_at: string;
        ticket_type_id: string;
        ticket_name: string;
        currency: string | null;
        unit_amount_cents: number;
        capacity: number;
        sold_count: number;
        min_per_order: number | null;
        max_per_order: number | null;
        sales_end_at: string | null;
      };

      if (row.status !== 'on_sale') {
        await client.query('rollback');
        return NextResponse.json(
          { error: 'Event is not on sale.' },
          { status: 400 },
        );
      }

      if (
        row.sales_end_at &&
        new Date(row.sales_end_at).getTime() < Date.now()
      ) {
        await client.query('rollback');
        return NextResponse.json(
          { error: 'Ticket sales have ended.' },
          { status: 400 },
        );
      }

      const minPerOrder = Number(row.min_per_order ?? 1);
      const maxPerOrder = row.max_per_order ? Number(row.max_per_order) : null;

      if (quantity < minPerOrder) {
        await client.query('rollback');
        return NextResponse.json(
          { error: `Minimum purchase is ${minPerOrder} tickets.` },
          { status: 400 },
        );
      }

      if (maxPerOrder !== null && quantity > maxPerOrder) {
        await client.query('rollback');
        return NextResponse.json(
          { error: `Maximum purchase is ${maxPerOrder} tickets.` },
          { status: 400 },
        );
      }

      const holdsRes = await client.query(
        `
        select coalesce(sum(qty), 0) as held_active
        from public.inventory_holds
        where ticket_type_id = $1
          and status = 'active'
          and expires_at > now()
        `,
        [row.ticket_type_id],
      );

      const capacity = Number(row.capacity);
      const sold = Number(row.sold_count);
      const heldActive = Number(holdsRes.rows[0]?.held_active ?? 0);
      const remaining = capacity - sold - heldActive;

      if (quantity > remaining) {
        await client.query('rollback');
        return NextResponse.json(
          { error: `Only ${Math.max(0, remaining)} tickets remaining.` },
          { status: 400 },
        );
      }

      const unitAmount = Number(row.unit_amount_cents);
      const subtotalCents = unitAmount * quantity;

      const venueKey: VenueKey =
        row.venue_key === 'prohibition' ? 'prohibition' : 'jungle_bird';

      const venueBasePath = getVenueBasePath(venueKey);
      const successUrl = `${origin}${venueBasePath}/events/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}${venueBasePath}/events/cancelled`;

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: buyerEmail,
        line_items: [
          {
            price_data: {
              currency: row.currency ?? 'cad',
              product_data: {
                name: `${row.title} - ${row.ticket_name}`,
              },
              unit_amount: unitAmount,
            },
            quantity,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          venue_key: venueKey,
          sanity_event_id: sanityEventId,
          sanity_ticket_type_id: sanityTicketTypeId,
          event_id: String(row.event_id),
          ticket_type_id: String(row.ticket_type_id),
          buyer_first_name: buyerFirstName,
          buyer_last_name: buyerLastName,
          buyer_email: buyerEmail,
          quantity: String(quantity),
          unit_amount_cents: String(unitAmount),
          subtotal_cents: String(subtotalCents),
        },
        payment_intent_data: {
          metadata: {
            venue_key: venueKey,
            sanity_event_id: sanityEventId,
            sanity_ticket_type_id: sanityTicketTypeId,
          },
        },
      });

      await client.query(
        `
        insert into public.inventory_holds (
          event_id,
          ticket_type_id,
          stripe_checkout_session_id,
          qty,
          expires_at,
          status
        )
        values ($1, $2, $3, $4, now() + ($5 || ' minutes')::interval, 'active')
        `,
        [
          row.event_id,
          row.ticket_type_id,
          session.id,
          quantity,
          String(HOLD_TTL_MINUTES),
        ],
      );

      await client.query('commit');

      return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (err) {
      await client.query('rollback');
      console.error(err);
      return NextResponse.json(
        { error: 'Failed to create checkout session.' },
        { status: 500 },
      );
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
