'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  sanityEventId: string;
  sanityTicketTypeId: string | null;
  eventTitle: string;
  ticketTypeName: string;
  minPerOrder: number;
  maxPerOrder: number | null;
  remaining: number;
  unitAmountCents: number;
  currency: string;
  ticketSaleEndsAt?: string | null;
};

const COMMON_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
];

const COMMON_TYPO_MAP: Record<string, string> = {
  'gmal.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'hotnail.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'iclod.com': 'icloud.com',
};

function formatMoney(cents: number, currency: string) {
  const dollars = cents / 100;

  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase(),
    currencyDisplay: 'narrowSymbol',
  }).format(dollars);
}

function formatSaleEnds(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const date = new Intl.DateTimeFormat('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d);

  const time = new Intl.DateTimeFormat('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);

  return `${date} at ${time}`;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getEmailSuggestion(email: string) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return null;

  const [, domain = ''] = normalized.split('@');
  if (!domain) return null;

  if (COMMON_TYPO_MAP[domain]) {
    return normalized.replace(domain, COMMON_TYPO_MAP[domain]);
  }

  if (COMMON_EMAIL_DOMAINS.includes(domain)) {
    return null;
  }

  return null;
}

export default function BuyTicketsForm({
  sanityEventId,
  sanityTicketTypeId,
  eventTitle,
  ticketTypeName,
  minPerOrder,
  maxPerOrder,
  remaining,
  unitAmountCents,
  currency,
  ticketSaleEndsAt,
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
  const [confirmEmail, setConfirmEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const salesEnded = useMemo(() => {
    if (!ticketSaleEndsAt) return false;
    const t = Date.parse(ticketSaleEndsAt);
    if (!Number.isFinite(t)) return false;
    return t <= Date.now();
  }, [ticketSaleEndsAt]);

  const disabled = salesEnded || remaining <= 0 || maxSelectable <= 0;
  const total = unitAmountCents * qty;
  const safeTicketTypeName = (ticketTypeName || 'General Admission').trim();

  const [saleEndsLabel, setSaleEndsLabel] = useState<string | null>(null);

  useEffect(() => {
    setSaleEndsLabel(formatSaleEnds(ticketSaleEndsAt));
  }, [ticketSaleEndsAt]);

  const suggestedEmail = useMemo(() => getEmailSuggestion(email), [email]);

  async function handleCheckout() {
    setErr(null);
    if (disabled) return;

    if (!sanityTicketTypeId) {
      setErr('Ticket type is not available yet. Please try again in a moment.');
      return;
    }

    if (salesEnded) {
      setErr('Ticket sales have ended for this event.');
      return;
    }

    if (!first.trim() || !last.trim()) {
      setErr('Please enter your first and last name.');
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedConfirmEmail = normalizeEmail(confirmEmail);

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      setErr('Please enter a valid email.');
      return;
    }

    if (!normalizedConfirmEmail) {
      setErr('Please confirm your email.');
      return;
    }

    if (normalizedEmail !== normalizedConfirmEmail) {
      setErr('Email and confirm email must match.');
      return;
    }

    if (suggestedEmail && normalizedEmail !== suggestedEmail) {
      setErr(`Did you mean ${suggestedEmail}?`);
      return;
    }

    if (qty < minPerOrder) {
      setErr(`Minimum purchase is ${minPerOrder} tickets.`);
      return;
    }

    if (qty > maxSelectable) {
      setErr('Selected quantity is no longer available.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/events/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sanityEventId,
          sanityTicketTypeId,
          quantity: qty,
          buyerFirstName: first.trim(),
          buyerLastName: last.trim(),
          buyerEmail: normalizedEmail,
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
    } catch {
      setErr('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-7">
      <h2 className="text-xl font-semibold text-white lg:text-2xl">Tickets</h2>

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
      </div>

      {saleEndsLabel ? (
        <p className="mt-2 text-sm text-white/60">
          Ticket sales end at{' '}
          <span className="text-white/80">{saleEndsLabel}</span>
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-white placeholder:text-white/40 lg:py-4"
          placeholder="First name"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          disabled={loading || disabled}
        />

        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-white placeholder:text-white/40 lg:py-4"
          placeholder="Last name"
          value={last}
          onChange={(e) => setLast(e.target.value)}
          disabled={loading || disabled}
        />
      </div>

      <div className="mt-3 space-y-3">
        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-white placeholder:text-white/40 lg:py-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || disabled}
        />

        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-white placeholder:text-white/40 lg:py-4"
          placeholder="Confirm email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          disabled={loading || disabled}
        />

        {suggestedEmail ? (
          <p className="text-xs text-amber-300">
            Did you mean{' '}
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => {
                setEmail(suggestedEmail);
                setConfirmEmail(suggestedEmail);
                setErr(null);
              }}
            >
              {suggestedEmail}
            </button>
            ?
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-white/80">Quantity</label>
        <select
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
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
        className={`btn-pop mt-5 w-full rounded-xl px-4 py-3.5 text-sm font-semibold lg:py-4 ${
          loading || disabled
            ? 'cursor-not-allowed border border-white/10 bg-white/5 text-white/40'
            : 'bg-[var(--cta)] text-[#1b1612]'
        }`}
      >
        {disabled
          ? salesEnded
            ? 'Sales ended'
            : 'Sold out'
          : loading
            ? 'Starting checkout…'
            : 'Buy tickets'}
      </button>

      <p className="mt-3 text-xs text-white/50">
        Tickets are emailed immediately after purchase.
      </p>
    </section>
  );
}
