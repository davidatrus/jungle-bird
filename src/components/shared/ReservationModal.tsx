'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const OPENTABLE_SCRIPT_SRC =
  '//www.opentable.ca/widget/reservation/loader?rid=1471021&type=standard&theme=standard&color=1&dark=false&iframe=true&domain=ca&lang=en-CA&newtab=false&ot_source=Restaurant%20website&cfe=true';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ReservationModal({ open, onClose }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // escape key closes
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
    const host = hostRef.current;
    if (!host) return;

    // hard reset container so we never get duplicates
    host.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = OPENTABLE_SCRIPT_SRC;
    script.async = true;

    host.appendChild(script);

    return () => {
      host.innerHTML = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Reservations"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-4 py-3">
          <p className="text-sm font-semibold tracking-[0.12em] uppercase">
            Reservations
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
          <div ref={hostRef} />
        </div>

        <div className="px-4 pb-4 text-xs opacity-80">
          If the widget does not load, try disabling strict tracking protection
          or open in a private window.
        </div>
      </div>
    </div>,
    document.body,
  );
}
