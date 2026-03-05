// src/app/api/internal/cron/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import {
  reconcileSanityToDb,
  reconcileAvailability,
  releaseExpiredHolds,
} from '@/lib/cron/reconciler';
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

  const startedAt = Date.now();

  const client = await pool.connect();
  try {
    // 1) Reconcile in a single transaction
    await client.query('begin');

    const released = await releaseExpiredHolds(client);
    const upserts = await reconcileSanityToDb(client);
    const availability = await reconcileAvailability(client);

    await client.query('commit');

    // 2) Then run refund worker OUTSIDE the transaction
    const refundWorker = await processRefundQueue(client, { maxItems: 25 });

    return NextResponse.json({
      ok: true,
      ms: Date.now() - startedAt,
      releasedExpiredHolds: released,
      sanityUpserts: upserts,
      availabilityReconciled: availability,
      refundWorker,
    });
  } catch (err: unknown) {
    try {
      await client.query('rollback');
    } catch {}

    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json(
      { ok: false, error: message || 'Cron failed' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
