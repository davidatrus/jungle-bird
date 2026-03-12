import Link from 'next/link';
import { redirect } from 'next/navigation';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const sessionId = session_id;

  if (!sessionId) redirect('/events');

  const res = await pool.query(
    `
    select status, buyer_email
    from public.orders
    where stripe_checkout_session_id = $1
    limit 1
    `,
    [sessionId],
  );

  const row = res.rows[0] as
    | { status: string; buyer_email: string | null }
    | undefined;

  if (!row) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-14">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold text-white">Purchase confirmed</h1>
          <p className="mt-3 text-white/80">
            We are processing your order now. If you do not see your tickets
            within a few minutes, check your spam folder.
          </p>

          <p className="mt-6 text-xs break-all text-white/50">
            Session: {sessionId}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="btn-pop inline-block rounded-xl bg-[var(--cta)] px-5 py-3 text-sm font-semibold text-[#1b1612]"
            >
              Back to events
            </Link>

            <a
              href="mailto:junglebirdtikiyyc@gmail.com?subject=Wrong%20ticket%20email%20for%20session%20ID%20${encodeURIComponent(sessionId)}"
              className="btn-pop inline-block rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
            >
              Wrong Email? Contact Us
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (row.status === 'refunded' || row.status === 'failed') {
    redirect(`/events/refunded?session_id=${encodeURIComponent(sessionId)}`);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold text-white">Purchase confirmed</h1>
        <p className="mt-3 text-white/80">
          Your tickets are being emailed to you now. If you do not see them
          within a few minutes, check your spam folder.
        </p>

        {row.buyer_email ? (
          <p className="mt-3 text-sm text-white/70">
            Tickets sent to:{' '}
            <span className="text-white">{row.buyer_email}</span>
          </p>
        ) : null}

        <p className="mt-3 text-xs text-white/50">
          Session ID helps staff identify your order if the email is wrong.
        </p>

        <p className="mt-6 text-xs break-all text-white/50">
          Session: {sessionId}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/events"
            className="btn-pop inline-block rounded-xl bg-[var(--cta)] px-5 py-3 text-sm font-semibold text-[#1b1612]"
          >
            Back to events
          </Link>

          <a
            href={`mailto:junglebirdtikiyyc@gmail.com?subject=Wrong%20ticket%20email%20for%20session%20ID%20${encodeURIComponent(sessionId)}`}
            className="btn-pop inline-block rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
          >
            Wrong Email? Contact Us
          </a>
        </div>
      </div>
    </main>
  );
}
