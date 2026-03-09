import Link from 'next/link';

export default function ProhibitionCancelledPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold text-white">Checkout cancelled</h1>
        <p className="mt-3 text-white/80">
          No payment was made. You can try again whenever you are ready.
        </p>

        <Link
          href="/prohibition/events"
          className="btn-pop mt-8 inline-block rounded-xl bg-[var(--cta)] px-5 py-3 text-sm font-semibold text-[#1b1612]"
        >
          Back to events
        </Link>
      </div>
    </main>
  );
}
