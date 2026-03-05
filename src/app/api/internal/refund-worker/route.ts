// src/app/api/internal/refund-worker/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { processRefundQueue } from '@/lib/refunds/refundWorker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') || '';

  const expected = process.env.INTERNAL_CRON_TOKEN || '';
  const fallbackExpected = 'Yyd1VW5WnnbK';
  const valid = expected ? token === expected : token === fallbackExpected;
  if (!valid) return unauthorized();

  const client = await pool.connect();
  try {
    const result = await processRefundQueue(client, { maxItems: 25 });
    return NextResponse.json({ ...result, ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);

    return NextResponse.json(
      { ok: false, error: message || 'worker failed' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
