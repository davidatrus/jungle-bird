import Link from 'next/link';
import { redirect } from 'next/navigation';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function RefundedPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const sessionId = session_id;

  if (!sessionId) redirect('/events');

  const res = await pool.query(
    `
    select refunded_amount_cents, refunded_at, stripe_refund_id
    from public.orders
    where stripe_checkout_session_id = $1
    limit 1
    `,
    [sessionId],
  );

  const row = res.rows[0] as
    | {
        refunded_amount_cents: number | null;
        refunded_at: string | null;
        stripe_refund_id: string | null;
      }
    | undefined;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold text-white">Refund confirmed</h1>
        <p className="mt-3 text-white/80">
          This event sold out before your payment finished processing, so we
          automatically refunded your purchase. Stripe may take a short time to
          show the refund on your statement.
        </p>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm text-white/70">Refund amount</p>
              <p className="mt-2 text-sm text-white/70">Refunded at</p>
              <p className="mt-2 text-sm text-white/70">Refund id</p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                {row?.refunded_amount_cents
                  ? `CA$${(row.refunded_amount_cents / 100).toFixed(2)}`
                  : '—'}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {row?.refunded_at
                  ? new Date(row.refunded_at).toLocaleString()
                  : '—'}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {row?.stripe_refund_id ?? '—'}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-white/50">Session: {sessionId}</p>

        <Link
          href="/events"
          className="btn-pop mt-8 inline-block rounded-xl bg-[var(--cta)] px-5 py-3 text-sm font-semibold text-[#1b1612]"
        >
          Back to events
        </Link>
      </div>
    </main>
  );
}
