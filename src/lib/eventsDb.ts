import { pool } from '@/lib/db';

export type TicketTypeAvailability = {
  ticketTypeId: string;
  eventId: string;
  capacity: number;
  soldCount: number;
  heldActive: number;
  remaining: number;
};

export async function getAvailabilityBySanityEventIds(
  sanityEventIds: string[],
): Promise<Record<string, TicketTypeAvailability[]>> {
  if (sanityEventIds.length === 0) return {};

  const res = await pool.query(
    `
    select
      e.sanity_event_id,
      a.ticket_type_id,
      a.event_id,
      a.capacity,
      a.sold_count,
      a.held_active,
      a.remaining
    from public.events e
    join public.ticket_type_availability a on a.event_id = e.id
    where e.sanity_event_id = any($1::text[])
    `,
    [sanityEventIds],
  );

  const map: Record<string, TicketTypeAvailability[]> = {};
  for (const row of res.rows) {
    const sid = row.sanity_event_id as string;
    if (!map[sid]) map[sid] = [];
    map[sid].push({
      ticketTypeId: row.ticket_type_id,
      eventId: row.event_id,
      capacity: Number(row.capacity),
      soldCount: Number(row.sold_count),
      heldActive: Number(row.held_active),
      remaining: Number(row.remaining),
    });
  }
  return map;
}

export function computeBadges(input: {
  isFeatured?: boolean;
  createdAt?: string | null;
  remaining?: number | null;
  capacity?: number | null;
}) {
  const badges: string[] = [];

  if (input.isFeatured) badges.push('Featured');

  if (input.createdAt) {
    const created = new Date(input.createdAt).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - created < sevenDays) badges.push('New');
  }

  if (
    typeof input.remaining === 'number' &&
    typeof input.capacity === 'number'
  ) {
    if (input.remaining <= 0) badges.push('Sold Out');
    else if (
      input.remaining <= 10 ||
      input.remaining / input.capacity <= 0.15
    ) {
      badges.push('Almost Sold Out');
    }
  }

  return badges;
}
