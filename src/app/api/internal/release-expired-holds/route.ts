// src/app/api/internal/release-expired-holds/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  const expected = process.env.CRON_SECRET; // <- dedicated cron secret

  if (!expected) {
    return NextResponse.json(
      { error: 'Missing CRON_SECRET env var' },
      { status: 500 },
    );
  }

  if (!token || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await pool.query(
      `
      update public.inventory_holds
      set status = 'released'
      where status = 'active'
        and expires_at <= now()
      returning id
      `,
    );

    return NextResponse.json({ released: res.rowCount });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to release expired holds' },
      { status: 500 },
    );
  }
}
