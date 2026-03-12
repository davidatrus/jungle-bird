'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

type ScanResult = null | {
  status: number;
  ok?: boolean;
  result?: string;
  event_title?: string;
  venue_key?: string | null;
  buyer?: { name: string; email: string };
  checked_in_at?: string;
  error?: string;
};

type ResendLookupResult = null | {
  ok?: boolean;
  error?: string;
  order?: {
    id: string;
    status: string;
    buyer_name: string;
    buyer_email: string;
    quantity: number;
    unit_amount_cents: number;
    currency: string;
    email_sent_at: string | null;
    last_ticket_resent_at: string | null;
    ticket_email_send_count: number;
    stripe_checkout_session_id: string | null;
    event_title: string;
    starts_at: string | null;
    ends_at: string | null;
    venue_key: string | null;
    event_id?: string;
    ticket_type_id?: string;
  };
  resent?: boolean;
  reissued?: boolean;
};

function statusMeta(r: ScanResult) {
  if (!r) return { label: '', bg: '#e5e7eb', fg: '#111827' };

  if (r.result === 'valid') {
    return { label: 'VALID', bg: '#dcfce7', fg: '#166534' };
  }
  if (r.result === 'already_used') {
    return { label: 'ALREADY USED', bg: '#fef9c3', fg: '#854d0e' };
  }
  if (r.result === 'not_found') {
    return { label: 'NOT FOUND', bg: '#fee2e2', fg: '#991b1b' };
  }
  if (r.result === 'invalid_code') {
    return { label: 'INVALID CODE', bg: '#fee2e2', fg: '#991b1b' };
  }
  if (r.result === 'unauthorized') {
    return { label: 'UNAUTHORIZED', bg: '#fee2e2', fg: '#991b1b' };
  }
  if (r.result === 'scan_error') {
    return { label: 'ERROR', bg: '#fee2e2', fg: '#991b1b' };
  }
  if (r.result === 'voided') {
    return { label: 'VOIDED', bg: '#fee2e2', fg: '#991b1b' };
  }
  if (r.result === 'event_cancelled') {
    return { label: 'EVENT CANCELLED', bg: '#fee2e2', fg: '#991b1b' };
  }

  return { label: r.ok ? 'OK' : 'ERROR', bg: '#e5e7eb', fg: '#111827' };
}

function formatVenueLabel(venueKey?: string | null) {
  if (venueKey === 'prohibition') return 'Prohibition';
  if (venueKey === 'jungle_bird') return 'Jungle Bird';
  return venueKey || '';
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: (currency || 'cad').toUpperCase(),
    currencyDisplay: 'narrowSymbol',
  }).format((cents || 0) / 100);
}

const LS_KEY = 'jb_admin_scan_token';

export default function AdminScanPage() {
  const [code, setCode] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [result, setResult] = useState<ScanResult>(null);
  const [loading, setLoading] = useState(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(true);

  const [lookupOrderId, setLookupOrderId] = useState('');
  const [lookupSessionId, setLookupSessionId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<ResendLookupResult>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const [reissueLoading, setReissueLoading] = useState(false);
  const [reissueMessage, setReissueMessage] = useState<string | null>(null);
  const [reissueReason, setReissueReason] = useState(
    'Wrong email / ticket reissue',
  );

  const codeRef = useRef<HTMLInputElement | null>(null);
  const videoWrapRef = useRef<HTMLDivElement | null>(null);

  const lastCodeRef = useRef<string>('');
  const cooldownUntilRef = useRef<number>(0);
  const inFlightRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LS_KEY) || '';
      if (saved) setAdminToken(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const c = sp.get('code');
    if (c) setCode(c.toUpperCase().trim());
  }, []);

  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  const meta = useMemo(() => statusMeta(result), [result]);

  async function onScan(e?: React.FormEvent) {
    if (e) e.preventDefault();

    const now = Date.now();
    if (inFlightRef.current) return;
    if (now < cooldownUntilRef.current) return;

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    inFlightRef.current = true;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          code: trimmed,
          scanner_label: 'admin-scan-page',
        }),
      });

      const data = await res.json().catch(() => ({}));
      setResult({ status: res.status, ...data });

      setTimeout(() => codeRef.current?.focus(), 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setResult({ status: 0, ok: false, error: message });
    } finally {
      setLoading(false);
      inFlightRef.current = false;
      cooldownUntilRef.current = Date.now() + 1200;
    }
  }

  function saveToken() {
    try {
      window.localStorage.setItem(LS_KEY, adminToken);
    } catch {}
  }

  function clearToken() {
    setAdminToken('');
    try {
      window.localStorage.removeItem(LS_KEY);
    } catch {}
  }

  async function handleLookup() {
    setLookupLoading(true);
    setLookupResult(null);
    setResendMessage(null);
    setReissueMessage(null);

    try {
      const res = await fetch('/api/admin/resend-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'lookup',
          orderId: lookupOrderId.trim() || undefined,
          sessionId: lookupSessionId.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      setLookupResult(data);

      if (data?.order?.buyer_email) {
        setResendEmail(data.order.buyer_email);
      } else {
        setResendEmail('');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lookup failed';
      setLookupResult({ error: message });
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleResend() {
    if (!lookupResult?.order?.id) return;

    setResendLoading(true);
    setResendMessage(null);

    try {
      const res = await fetch('/api/admin/resend-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'resend',
          orderId: lookupResult.order.id,
          buyerEmail: resendEmail.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResendMessage(data?.error || 'Resend failed');
        return;
      }

      setResendMessage(
        `Tickets resent to ${data?.order?.buyer_email || resendEmail}`,
      );
      await handleLookup();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Resend failed';
      setResendMessage(message);
    } finally {
      setResendLoading(false);
    }
  }

  async function handleReissue() {
    if (!lookupResult?.order?.id) return;

    setReissueLoading(true);
    setReissueMessage(null);

    try {
      const res = await fetch('/api/admin/reissue-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'reissue',
          orderId: lookupResult.order.id,
          buyerEmail: resendEmail.trim(),
          reason: reissueReason.trim() || 'Admin ticket reissue',
          adminLabel: 'admin-scan-page',
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setReissueMessage(data?.error || 'Reissue failed');
        return;
      }

      setReissueMessage(
        `Tickets reissued and sent to ${data?.order?.buyer_email || resendEmail}`,
      );
      await handleLookup();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Reissue failed';
      setReissueMessage(message);
    } finally {
      setReissueLoading(false);
    }
  }

  useEffect(() => {
    if (!cameraOn) return;

    const reader = new BrowserMultiFormatReader();
    let stopped = false;
    let controls: { stop: () => void } | null = null;

    const start = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const preferred = devices.find((d) =>
          /back|rear|environment/i.test(d.label),
        );

        const container = videoWrapRef.current;
        if (!container) return;

        container.innerHTML = '';
        const video = document.createElement('video');
        video.setAttribute('playsinline', 'true');
        video.style.width = '100%';
        video.style.borderRadius = '14px';
        video.style.border = '1px solid rgba(255,255,255,0.12)';
        container.appendChild(video);

        controls = await reader.decodeFromVideoDevice(
          preferred?.deviceId ?? undefined,
          video,
          (res) => {
            if (stopped) return;

            if (res) {
              const text = (res.getText() || '').trim();
              if (!text) return;

              const now = Date.now();
              if (now < cooldownUntilRef.current) return;

              let found = text.toUpperCase();

              try {
                if (/^https?:\/\//i.test(text)) {
                  const u = new URL(text);
                  const c = u.searchParams.get('code');
                  if (c) found = c.toUpperCase().trim();
                }
              } catch {}

              if (found === lastCodeRef.current) return;

              lastCodeRef.current = found;
              setCode(found);

              cooldownUntilRef.current = now + 1500;

              if (autoSubmit && adminToken) {
                setTimeout(() => onScan(), 0);
              }
            }
          },
        );
      } catch (e) {
        console.error('Camera start failed:', e);
        setCameraOn(false);
      }
    };

    start();

    return () => {
      stopped = true;
      try {
        controls?.stop();
      } catch {}
      controls = null;

      if (videoWrapRef.current) videoWrapRef.current.innerHTML = '';
    };
  }, [cameraOn, autoSubmit, adminToken]);

  return (
    <div
      style={{
        maxWidth: 760,
        margin: '48px auto',
        padding: 18,
        fontFamily: 'system-ui',
        color: 'white',
      }}
    >
      <h1
        style={{
          fontSize: 34,
          letterSpacing: 2,
          textAlign: 'center',
          marginBottom: 18,
        }}
      >
        TICKET SCAN
      </h1>

      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 18,
          padding: 16,
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        }}
      >
        <form onSubmit={onScan} style={{ display: 'grid', gap: 12 }}>
          <input
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            placeholder="Admin token (Bearer)"
            style={{
              padding: 12,
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.25)',
              color: 'white',
            }}
          />

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              onClick={saveToken}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(0,0,0,0.25)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Save token
            </button>

            <button
              type="button"
              onClick={clearToken}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(0,0,0,0.25)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Clear
            </button>

            <label
              style={{
                marginLeft: 'auto',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                fontSize: 13,
                opacity: 0.9,
              }}
            >
              <input
                type="checkbox"
                checked={autoSubmit}
                onChange={(e) => setAutoSubmit(e.target.checked)}
              />
              Auto submit after scan
            </label>
          </div>

          <input
            ref={codeRef}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ticket code (12 hex chars)"
            style={{
              padding: 12,
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.25)',
              color: 'white',
              letterSpacing: 1,
              fontSize: 16,
            }}
          />

          <button
            disabled={loading}
            style={{
              padding: 14,
              borderRadius: 12,
              border: 'none',
              background: 'black',
              color: 'white',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Checking...' : 'Scan / Check in'}
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setCameraOn((v) => !v)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.18)',
                background: cameraOn
                  ? 'rgba(16,185,129,0.15)'
                  : 'rgba(0,0,0,0.25)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              {cameraOn ? 'Stop camera' : 'Start camera'}
            </button>

            <button
              type="button"
              onClick={() => {
                setCode('');
                setResult(null);
                lastCodeRef.current = '';
                cooldownUntilRef.current = 0;
                setTimeout(() => codeRef.current?.focus(), 0);
              }}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(0,0,0,0.25)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              Clear code
            </button>
          </div>
        </form>

        {cameraOn && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
              Point the camera at the QR code.
            </div>
            <div ref={videoWrapRef} />
          </div>
        )}

        {result && (
          <div
            style={{
              marginTop: 16,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(0,0,0,0.25)',
              padding: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: meta.bg,
                  color: meta.fg,
                  fontWeight: 900,
                  fontSize: 12,
                  letterSpacing: 1,
                }}
              >
                {meta.label}
              </span>

              <span style={{ opacity: 0.8, fontSize: 13 }}>
                HTTP {result.status}
              </span>
            </div>

            {result.event_title && (
              <div style={{ fontWeight: 800, marginBottom: 6 }}>
                {result.event_title}
              </div>
            )}

            {result.venue_key && (
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 6 }}>
                Venue: {formatVenueLabel(result.venue_key)}
              </div>
            )}

            {result.buyer && (
              <div style={{ fontSize: 14, opacity: 0.92, marginBottom: 6 }}>
                {result.buyer.name} · {result.buyer.email}
              </div>
            )}

            {result.checked_in_at && (
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
                Checked in at: {result.checked_in_at}
              </div>
            )}

            {result.error && (
              <div style={{ fontSize: 13, color: '#fecaca' }}>
                {result.error}
              </div>
            )}

            <details style={{ marginTop: 10 }}>
              <summary
                style={{ cursor: 'pointer', fontSize: 13, opacity: 0.85 }}
              >
                Raw response
              </summary>
              <pre
                style={{
                  marginTop: 10,
                  padding: 12,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  overflowX: 'auto',
                  color: 'white',
                  fontSize: 12,
                }}
              >
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 20,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 18,
          padding: 18,
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        }}
      >
        <h2
          style={{
            fontSize: 24,
            marginBottom: 14,
            letterSpacing: 1,
          }}
        >
          ORDER EMAIL & TICKET TOOLS
        </h2>

        <div style={{ display: 'grid', gap: 12 }}>
          <input
            value={lookupOrderId}
            onChange={(e) => setLookupOrderId(e.target.value)}
            placeholder="Order ID"
            style={{
              padding: 12,
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.25)',
              color: 'white',
            }}
          />

          <input
            value={lookupSessionId}
            onChange={(e) => setLookupSessionId(e.target.value)}
            placeholder="Session ID (optional)"
            style={{
              padding: 12,
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.25)',
              color: 'white',
            }}
          />

          <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.45 }}>
            Use order ID as the main workflow. Session ID can help if the guest
            only has the success-page reference.
          </div>

          <button
            type="button"
            onClick={handleLookup}
            disabled={lookupLoading}
            style={{
              padding: 14,
              borderRadius: 12,
              border: 'none',
              background: '#111827',
              color: 'white',
              fontWeight: 800,
              cursor: lookupLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {lookupLoading ? 'Looking up...' : 'Lookup order'}
          </button>
        </div>

        {lookupResult?.error && (
          <div style={{ marginTop: 12, color: '#fecaca', fontSize: 14 }}>
            {lookupResult.error}
          </div>
        )}

        {lookupResult?.order && (
          <div
            style={{
              marginTop: 18,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(0,0,0,0.25)',
              padding: 16,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 20,
                marginBottom: 10,
              }}
            >
              {lookupResult.order.event_title}
            </div>

            <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
              <div style={{ fontSize: 14, opacity: 0.92 }}>
                Venue: {formatVenueLabel(lookupResult.order.venue_key)}
              </div>

              <div style={{ fontSize: 14, opacity: 0.92 }}>
                Order ID: {lookupResult.order.id}
              </div>

              {lookupResult.order.stripe_checkout_session_id && (
                <div style={{ fontSize: 14, opacity: 0.92, lineHeight: 1.45 }}>
                  Session ID: {lookupResult.order.stripe_checkout_session_id}
                </div>
              )}

              <div style={{ fontSize: 14, opacity: 0.92 }}>
                Buyer: {lookupResult.order.buyer_name}
              </div>

              <div style={{ fontSize: 14, opacity: 0.92 }}>
                Status: {lookupResult.order.status}
              </div>

              <div style={{ fontSize: 14, opacity: 0.92 }}>
                Qty: {lookupResult.order.quantity} · Price:{' '}
                {formatMoney(
                  lookupResult.order.unit_amount_cents,
                  lookupResult.order.currency,
                )}
              </div>

              <div style={{ fontSize: 14, opacity: 0.92 }}>
                First sent:{' '}
                {lookupResult.order.email_sent_at || 'Never / unknown'}
              </div>

              <div style={{ fontSize: 14, opacity: 0.92 }}>
                Last resent:{' '}
                {lookupResult.order.last_ticket_resent_at || 'Never'}
              </div>

              <div style={{ fontSize: 14, opacity: 0.92 }}>
                Send count: {lookupResult.order.ticket_email_send_count ?? 0}
              </div>
            </div>

            <div
              style={{
                marginTop: 8,
                paddingTop: 14,
                borderTop: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                Resend to email
              </div>

              <input
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Buyer email"
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.25)',
                  color: 'white',
                  marginBottom: 12,
                }}
              />

              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: 'none',
                  background: '#065f46',
                  color: 'white',
                  fontWeight: 800,
                  cursor: resendLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {resendLoading ? 'Resending...' : 'Resend tickets'}
              </button>

              {resendMessage && (
                <div style={{ marginTop: 12, fontSize: 14, color: '#bbf7d0' }}>
                  {resendMessage}
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 18,
                paddingTop: 18,
                borderTop: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                Reissue tickets
              </div>

              <div
                style={{
                  fontSize: 13,
                  opacity: 0.82,
                  marginBottom: 10,
                  lineHeight: 1.45,
                }}
              >
                Reissuing voids the current active ticket codes on this order
                and creates brand new ones. Use this if tickets were sent to the
                wrong email and you want to invalidate the old QR codes.
              </div>

              <input
                value={reissueReason}
                onChange={(e) => setReissueReason(e.target.value)}
                placeholder="Reason for reissue"
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.25)',
                  color: 'white',
                  marginBottom: 12,
                }}
              />

              <button
                type="button"
                onClick={handleReissue}
                disabled={reissueLoading}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: 'none',
                  background: '#991b1b',
                  color: 'white',
                  fontWeight: 800,
                  cursor: reissueLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {reissueLoading ? 'Reissuing...' : 'Reissue tickets'}
              </button>

              {reissueMessage && (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 14,
                    color: reissueMessage.toLowerCase().includes('failed')
                      ? '#fecaca'
                      : '#fde68a',
                  }}
                >
                  {reissueMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
