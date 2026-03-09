//src/components/shared/ReservationModal.tsx
'use client';

import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getVenueConfig, type VenueKey } from '@/lib/venueConfig';

type Props = {
  open: boolean;
  onClose: () => void;
  venueKey?: VenueKey;
};

export default function ReservationModal({
  open,
  onClose,
  venueKey = 'jungle_bird',
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  const config = useMemo(() => getVenueConfig(venueKey), [venueKey]);
  const widgetScriptSrc = config.reservations.widgetScriptSrc;
  const fallbackMessage =
    config.reservations.fallbackMessage ||
    'Reservations are not available right now. Please try again later.';

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    if (!widgetScriptSrc) return;

    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = widgetScriptSrc;
    script.async = true;

    host.appendChild(script);

    return () => {
      host.innerHTML = '';
    };
  }, [open, widgetScriptSrc]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${config.shortName} reservations`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-4 py-3">
          <p className="text-sm font-semibold tracking-[0.12em] uppercase">
            {config.shortName} Reservations
          </p>
          <button
            type="button"
            onClick={onClose}
            className="brass-border rounded-full px-3 py-1 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        <div className="p-4">
          {widgetScriptSrc ? (
            <div ref={hostRef} />
          ) : (
            <div className="rounded-xl border border-[var(--line)] bg-black/20 p-4 text-sm text-[var(--text)]">
              {fallbackMessage}
            </div>
          )}
        </div>

        <div className="px-4 pb-4 text-xs opacity-80">
          {widgetScriptSrc
            ? 'If the widget does not load, try disabling strict tracking protection or open in a private window.'
            : 'Reservation widget coming soon.'}
        </div>
      </div>
    </div>,
    document.body,
  );
}
