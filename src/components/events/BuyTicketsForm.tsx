'use client';

import { useMemo, useState } from 'react';

type Props = {
  sanityEventId: string;
  eventTitle: string;
  ticketTypeName: string;
  minPerOrder: number;
  maxPerOrder: number | null;
  remaining: number;
  unitAmountCents: number;
  currency: string;
};

function formatMoney(cents: number, currency: string) {
  const dollars = cents / 100;

  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase(),
    currencyDisplay: 'narrowSymbol',
  }).format(dollars);
}

export default function BuyTicketsForm({
  sanityEventId,
  eventTitle,
  ticketTypeName,
  minPerOrder,
  maxPerOrder,
  remaining,
  unitAmountCents,
  currency,
}: Props) {
  const maxSelectable = useMemo(() => {
    const byRemaining = Math.max(0, remaining);
    const byMax = maxPerOrder ?? byRemaining;
    return Math.min(byRemaining, byMax);
  }, [remaining, maxPerOrder]);

  const [qty, setQty] = useState(() =>
    Math.min(Math.max(minPerOrder, 1), Math.max(maxSelectable, 1)),
  );
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const disabled = remaining <= 0 || maxSelectable <= 0;

  const total = unitAmountCents * qty;

  // ✅ nice fallback (in case Sanity ever sends blank)
  const safeTicketTypeName = (ticketTypeName || 'General Admission').trim();

  async function handleCheckout() {
    setErr(null);

    if (disabled) return;

    if (!first.trim() || !last.trim()) {
      setErr('Please enter your first and last name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr('Please enter a valid email.');
      return;
    }

    if (qty < minPerOrder) {
      setErr(`Minimum purchase is ${minPerOrder} tickets.`);
      return;
    }
    if (qty > maxSelectable) {
      setErr(`Only ${maxSelectable} tickets available for this purchase.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/events/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sanityEventId,
          quantity: qty,
          buyerFirstName: first.trim(),
          buyerLastName: last.trim(),
          buyerEmail: email.trim().toLowerCase(),

          // ✅ new (useful for Stripe line item naming / metadata)
          ticketTypeName: safeTicketTypeName,
          eventTitle,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErr(data?.error ?? 'Checkout failed. Please try again.');
        return;
      }

      if (!data?.url) {
        setErr('Checkout URL missing. Please try again.');
        return;
      }

      window.location.href = data.url;
    } catch (e) {
      setErr('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold text-white">Tickets</h2>

      {/* ✅ Option A: Event · Ticket Type */}
      <p className="mt-1 text-sm text-white/70">
        {eventTitle}
        <span className="text-white/50"> · </span>
        {safeTicketTypeName}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-white/90">
        <span className="text-sm">
          Price:{' '}
          <span className="font-semibold">
            {formatMoney(unitAmountCents, currency)}
          </span>
        </span>
        <span className="text-white/60">·</span>
        <span className="text-sm">
          Remaining:{' '}
          <span className="font-semibold">{Math.max(0, remaining)}</span>
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/40"
          placeholder="First name"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          disabled={loading || disabled}
        />
        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/40"
          placeholder="Last name"
          value={last}
          onChange={(e) => setLast(e.target.value)}
          disabled={loading || disabled}
        />
      </div>

      <div className="mt-3">
        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/40"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || disabled}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-white/80">Quantity</label>
        <select
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          disabled={loading || disabled}
        >
          {Array.from(
            { length: Math.max(0, maxSelectable - minPerOrder + 1) },
            (_, i) => minPerOrder + i,
          ).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <div className="ml-auto text-sm text-white/80">
          Total:{' '}
          <span className="font-semibold">{formatMoney(total, currency)}</span>
        </div>
      </div>

      {err ? <p className="mt-3 text-sm text-red-300">{err}</p> : null}

      <button
        onClick={handleCheckout}
        disabled={loading || disabled}
        className={`btn-pop mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold ${
          loading || disabled
            ? 'cursor-not-allowed border border-white/10 bg-white/5 text-white/40'
            : 'bg-[var(--cta)] text-[#1b1612]'
        }`}
      >
        {disabled ? 'Sold out' : loading ? 'Starting checkout…' : 'Buy tickets'}
      </button>

      <p className="mt-3 text-xs text-white/50">
        Tickets are emailed immediately after purchase.
      </p>
    </section>
  );
}
