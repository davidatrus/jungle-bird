'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

type ScanResult = null | {
  status: number;
  ok?: boolean;
  result?: string;
  event_title?: string;
  buyer?: { name: string; email: string };
  checked_in_at?: string;
  error?: string;
};

function statusMeta(r: ScanResult) {
  if (!r) return { label: '', bg: '#e5e7eb', fg: '#111827' };

  if (r.result === 'valid')
    return { label: 'VALID', bg: '#dcfce7', fg: '#166534' };
  if (r.result === 'already_used')
    return { label: 'ALREADY USED', bg: '#fef9c3', fg: '#854d0e' };
  if (r.result === 'not_found')
    return { label: 'NOT FOUND', bg: '#fee2e2', fg: '#991b1b' };
  if (r.result === 'invalid_code')
    return { label: 'INVALID CODE', bg: '#fee2e2', fg: '#991b1b' };
  if (r.result === 'unauthorized')
    return { label: 'UNAUTHORIZED', bg: '#fee2e2', fg: '#991b1b' };
  if (r.result === 'scan_error')
    return { label: 'ERROR', bg: '#fee2e2', fg: '#991b1b' };

  return { label: r.ok ? 'OK' : 'ERROR', bg: '#e5e7eb', fg: '#111827' };
}

const LS_KEY = 'jb_admin_scan_token';

export default function AdminScanPage() {
  const [code, setCode] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [result, setResult] = useState<ScanResult>(null);
  const [loading, setLoading] = useState(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(true);

  const codeRef = useRef<HTMLInputElement | null>(null);
  const videoWrapRef = useRef<HTMLDivElement | null>(null);

  // Load token from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LS_KEY) || '';
      if (saved) setAdminToken(saved);
    } catch {}
  }, []);

  // Support prefill from URL: /admin/scan?code=XXXX
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const c = sp.get('code');
    if (c) setCode(c.toUpperCase().trim());
  }, []);

  // Focus code input
  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  const meta = useMemo(() => statusMeta(result), [result]);

  async function onScan(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setResult(null);

    const trimmed = code.trim().toUpperCase();

    try {
      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ✅ Bearer auth
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          // Optional back-compat if you still have ADMIN_SCAN_KEY set:
          // "x-admin-key": adminToken,
        },
        body: JSON.stringify({
          code: trimmed,
          scanner_label: 'admin-scan-page',
        }),
      });

      const data = await res.json().catch(() => ({}));
      setResult({ status: res.status, ...data });

      // Keep focus ready for next scan
      setTimeout(() => codeRef.current?.focus(), 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed';

      setResult({ status: 0, ok: false, error: message });
    } finally {
      setLoading(false);
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

  // Camera scanning
  useEffect(() => {
    if (!cameraOn) return;

    const reader = new BrowserMultiFormatReader();
    let stopped = false;

    // This is what we stop on cleanup
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

        // IMPORTANT: decodeFromVideoDevice returns "controls" (with stop())
        controls = await reader.decodeFromVideoDevice(
          preferred?.deviceId ?? undefined,
          video,
          (res, err) => {
            if (stopped) return;

            if (res) {
              const text = (res.getText() || '').trim();
              if (!text) return;

              // Accept either raw code OR a URL containing ?code=XXXX
              let found = text.toUpperCase();

              try {
                if (/^https?:\/\//i.test(text)) {
                  const u = new URL(text);
                  const c = u.searchParams.get('code');
                  if (c) found = c.toUpperCase().trim();
                }
              } catch {}

              setCode(found);

              if (autoSubmit && adminToken) {
                setTimeout(() => onScan(), 50);
              }
            } else if (err) {
              // zxing throws "not found" style errors constantly while searching.
              // We ignore all decode errors here to avoid noisy logs.
              // If you want, you can log non-search errors by checking err.name/message.
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
        maxWidth: 560,
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

        {/* Camera preview */}
        {cameraOn && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
              Point the camera at the QR code.
            </div>
            <div ref={videoWrapRef} />
          </div>
        )}

        {/* Results */}
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
    </div>
  );
}
