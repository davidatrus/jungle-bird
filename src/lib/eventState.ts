// src/lib/eventState.ts
type EventStateInput = {
  status?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  salesEndAt?: string | null;
  remainingCount?: number | null;
};

function parseMs(iso?: string | null) {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

export function computeEventState(input: EventStateInput) {
  const status = (input.status || '').toLowerCase();
  const now = Date.now();

  const startsAtMs = parseMs(input.startsAt);
  const endsAtMs = parseMs(input.endsAt) ?? startsAtMs; // fallback
  const salesEndAtMs = parseMs(input.salesEndAt);

  const isCancelled = status === 'cancelled' || status === 'canceled';

  // “Event ended” if:
  // - explicitly ended in Sanity, OR
  // - time has passed (endsAt if present, otherwise startsAt)
  const isEnded = status === 'ended' || (endsAtMs !== null && now >= endsAtMs);

  // “Sales ended” if:
  // - salesEndAt passed, OR
  // - event ended, OR
  // - explicitly ended/cancelled
  const salesEnded =
    isCancelled ||
    isEnded ||
    (salesEndAtMs !== null ? now >= salesEndAtMs : false);

  const remaining =
    typeof input.remainingCount === 'number' ? input.remainingCount : null;

  const isSoldOut = remaining !== null ? remaining <= 0 : false;

  // “Purchasable” is strictly on_sale + not ended/cancelled + not salesEnded + not sold out
  const isOnSale = status === 'on_sale';
  const purchasable = isOnSale && !salesEnded && !isSoldOut && !isCancelled;

  return {
    status,
    isOnSale,
    isCancelled,
    isEnded,
    salesEnded,
    isSoldOut,
    purchasable,
    startsAtMs,
    endsAtMs,
    salesEndAtMs,
  };
}
