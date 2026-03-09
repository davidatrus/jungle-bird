// src/app/api/admin/scan/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

function requireAdmin(req: Request) {
  const expectedBearer = process.env.ADMIN_SCAN_TOKEN;
  const expectedLegacy = process.env.ADMIN_SCAN_KEY;

  const auth = req.headers.get('authorization') || '';
  const bearer = auth.toLowerCase().startsWith('bearer ')
    ? auth.slice(7).trim()
    : '';

  const legacy = req.headers.get('x-admin-key') || '';

  if (!expectedBearer && !expectedLegacy) {
    return { ok: false, reason: 'ADMIN_SCAN_TOKEN/ADMIN_SCAN_KEY not set' };
  }

  if (expectedBearer && bearer && bearer === expectedBearer) {
    return { ok: true as const, mode: 'bearer' as const };
  }

  if (expectedLegacy && legacy && legacy === expectedLegacy) {
    return { ok: true as const, mode: 'legacy' as const };
  }

  return { ok: false, reason: 'Unauthorized' };
}

function isValidTicketCode(code: string) {
  return /^[0-9A-F]{12}$/.test(code);
}

export async function POST(req: Request) {
  type ScanRequestBody = {
    code?: unknown;
    scanner_label?: unknown;
  };

  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, result: 'unauthorized' },
      { status: 401 },
    );
  }

  let body: ScanRequestBody;
  try {
    body = (await req.json()) as ScanRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, result: 'invalid_json' },
      { status: 400 },
    );
  }

  const code =
    typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';

  const scannerLabel =
    typeof body.scanner_label === 'string' ? body.scanner_label : null;

  if (!isValidTicketCode(code)) {
    return NextResponse.json(
      { ok: false, result: 'invalid_code' },
      { status: 400 },
    );
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    const ticketRes = await client.query(
      `
      select
        t.id as ticket_id,
        t.ticket_code,
        t.checked_in_at,
        t.voided_at,
        t.void_reason,
        e.title as event_title,
        e.venue_key,
        e.status as event_status,
        o.status as order_status,
        o.buyer_first_name,
        o.buyer_last_name,
        o.buyer_email
      from public.tickets t
      join public.orders o on o.id = t.order_id
      join public.events e on e.id = t.event_id
      where t.ticket_code = $1
      for update
      `,
      [code],
    );

    if (ticketRes.rowCount === 0) {
      await client
        .query(
          `
          insert into public.ticket_scans (ticket_id, scan_result, scanner_label)
          values (gen_random_uuid(), 'not_found', $1)
          `,
          [scannerLabel],
        )
        .catch(() => {});

      await client.query('commit');
      return NextResponse.json(
        { ok: false, result: 'not_found' },
        { status: 404 },
      );
    }

    const row = ticketRes.rows[0] as {
      ticket_id: string;
      checked_in_at: string | null;
      voided_at: string | null;
      void_reason: string | null;
      event_title: string;
      venue_key: string | null;
      event_status: string | null;
      order_status: string | null;
      buyer_first_name: string;
      buyer_last_name: string;
      buyer_email: string;
    };

    const buyer = {
      name: `${row.buyer_first_name} ${row.buyer_last_name}`,
      email: row.buyer_email,
    };

    const eventStatus = (row.event_status || '').toLowerCase();
    const orderStatus = (row.order_status || '').toLowerCase();

    // 1) Already used
    if (row.checked_in_at) {
      await client.query(
        `
        insert into public.ticket_scans (ticket_id, scan_result, scanner_label)
        values ($1, 'already_used', $2)
        `,
        [row.ticket_id, scannerLabel],
      );

      await client.query('commit');

      return NextResponse.json({
        ok: false,
        result: 'already_used',
        checked_in_at: row.checked_in_at,
        event_title: row.event_title,
        venue_key: row.venue_key,
        buyer,
      });
    }

    // 2) Ticket explicitly voided
    if (row.voided_at) {
      await client.query(
        `
        insert into public.ticket_scans (ticket_id, scan_result, scanner_label)
        values ($1, 'voided', $2)
        `,
        [row.ticket_id, scannerLabel],
      );

      await client.query('commit');

      return NextResponse.json({
        ok: false,
        result: 'voided',
        event_title: row.event_title,
        venue_key: row.venue_key,
        buyer,
        error: row.void_reason || 'This ticket is no longer valid.',
      });
    }

    // 3) Refunded/cancelled/failed order
    if (['refunded', 'cancelled', 'failed'].includes(orderStatus)) {
      await client.query(
        `
        insert into public.ticket_scans (ticket_id, scan_result, scanner_label)
        values ($1, 'voided', $2)
        `,
        [row.ticket_id, scannerLabel],
      );

      await client.query('commit');

      return NextResponse.json({
        ok: false,
        result: 'voided',
        event_title: row.event_title,
        venue_key: row.venue_key,
        buyer,
        error: `This ticket is tied to a ${orderStatus} order and is no longer valid.`,
      });
    }

    // 4) Cancelled event
    if (eventStatus === 'cancelled' || eventStatus === 'canceled') {
      await client.query(
        `
        insert into public.ticket_scans (ticket_id, scan_result, scanner_label)
        values ($1, 'event_cancelled', $2)
        `,
        [row.ticket_id, scannerLabel],
      );

      await client.query('commit');

      return NextResponse.json({
        ok: false,
        result: 'event_cancelled',
        event_title: row.event_title,
        venue_key: row.venue_key,
        buyer,
        error: 'This event has been cancelled. Ticket is not valid for entry.',
      });
    }

    // 5) Valid
    await client.query(
      `
      update public.tickets
      set checked_in_at = now()
      where id = $1
      `,
      [row.ticket_id],
    );

    await client.query(
      `
      insert into public.ticket_scans (ticket_id, scan_result, scanner_label)
      values ($1, 'valid', $2)
      `,
      [row.ticket_id, scannerLabel],
    );

    await client.query('commit');

    return NextResponse.json({
      ok: true,
      result: 'valid',
      event_title: row.event_title,
      venue_key: row.venue_key,
      buyer,
      checked_in_at: new Date().toISOString(),
    });
  } catch (err) {
    try {
      await client.query('rollback');
    } catch {}
    console.error(err);
    return NextResponse.json(
      { ok: false, result: 'scan_error' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
