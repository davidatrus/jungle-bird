import { pool } from '@/lib/db';

export type TicketTypeSummary = {
  eventId: string;
  ticketTypeId: string;
  name: string;
  currency: string;
  unitAmountCents: number;
  capacity: number;
  soldCount: number;
  heldActive: number;
  remaining: number;
  minPerOrder: number;
  maxPerOrder: number | null;
  salesEndAt: string | null;
};

export async function getPrimaryTicketTypeSummaryBySanityEventId(
  sanityEventId: string,
): Promise<TicketTypeSummary | null> {
  const res = await pool.query(
    `
    select
      e.id as event_id,
      tt.id as ticket_type_id,
      tt.name,
      tt.currency,
      tt.unit_amount_cents,
      tt.capacity,
      tt.sold_count,
      coalesce((
        select sum(h.qty)::int
        from public.inventory_holds h
        where h.ticket_type_id = tt.id
          and h.status = 'active'
          and h.expires_at > now()
      ), 0) as held_active,
      (tt.capacity - tt.sold_count - coalesce((
        select sum(h.qty)::int
        from public.inventory_holds h
        where h.ticket_type_id = tt.id
          and h.status = 'active'
          and h.expires_at > now()
      ), 0)) as remaining,
      tt.min_per_order,
      tt.max_per_order,
      tt.sales_end_at
    from public.events e
    join public.ticket_types tt on tt.event_id = e.id
    where e.sanity_event_id = $1
    order by tt.created_at asc
    limit 1
    `,
    [sanityEventId],
  );

  if (res.rowCount === 0) return null;

  const r = res.rows[0];
  return {
    eventId: String(r.event_id),
    ticketTypeId: String(r.ticket_type_id),
    name: String(r.name),
    currency: String(r.currency),
    unitAmountCents: Number(r.unit_amount_cents),
    capacity: Number(r.capacity),
    soldCount: Number(r.sold_count),
    heldActive: Number(r.held_active),
    remaining: Number(r.remaining),
    minPerOrder: Number(r.min_per_order ?? 1),
    maxPerOrder: r.max_per_order === null ? null : Number(r.max_per_order),
    salesEndAt: r.sales_end_at ? String(r.sales_end_at) : null,
  };
}

export function formatMoney(cents: number, currency: string) {
  const dollars = cents / 100;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(dollars);
}
