import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const sessionId = session_id;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold text-white">Purchase confirmed</h1>
        <p className="mt-3 text-white/80">
          Your tickets are being emailed to you now. If you do not see them
          within a few minutes, check your spam folder.
        </p>

        {sessionId ? (
          <p className="mt-6 text-xs text-white/50">Session: {sessionId}</p>
        ) : null}

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
