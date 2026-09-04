'use client';
// ============================================================
// AgriOS — Data State Components
// Every major data section uses Loading / Success / Empty /
// Error states so a single failed API never crashes a page.
// ============================================================
import { Loader2, AlertTriangle, Inbox, RefreshCw, Database } from 'lucide-react';

export function LoadingCard({ label = 'Loading farm intelligence…', sublabel }: { label?: string; sublabel?: string }) {
  return (
    <div
      className="card"
      role="status"
      aria-live="polite"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px', textAlign: 'center' }}
    >
      <Loader2 size={24} color="var(--agrios-green-500)" style={{ animation: 'spin 1.2s linear infinite' }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{sublabel}</div>}
      </div>
    </div>
  );
}

export function ErrorCard({ message = 'Data unavailable', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div
      className="card"
      role="alert"
      style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '20px', background: 'var(--agrios-red-100)', borderColor: 'var(--agrios-red-400)' }}
    >
      <AlertTriangle size={18} color="var(--agrios-red-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--agrios-red-600)', marginBottom: '4px' }}>Something went wrong</div>
        <div style={{ fontSize: '0.8rem', color: '#7f1d1d', lineHeight: 1.6 }}>{message}</div>
        {onRetry && (
          <button className="btn btn-ghost btn-sm" onClick={onRetry} style={{ marginTop: '10px' }}>
            <RefreshCw size={13} /> Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyCard({ message = 'No data available yet.' }: { message?: string }) {
  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '28px', textAlign: 'center' }}
    >
      <Inbox size={22} color="var(--text-muted)" />
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{message}</div>
    </div>
  );
}

/**
 * Honest "DEMO DATA" badge shown whenever a section falls back to
 * simulated values. Never pretend demo data is live.
 */
export function DemoBadge({ note = 'Demo data', style }: { note?: string; style?: React.CSSProperties }) {
  return (
    <span className="badge badge-demo" title="Simulated data — not from a live sensor or satellite" style={style}>
      <Database size={11} /> {note}
    </span>
  );
}

/**
 * Wraps a data section with the four states. `status` drives which
 * state renders; `children` is the success state.
 */
export function DataState({
  status,
  children,
  loadingLabel,
  errorMessage,
  emptyMessage,
  onRetry,
}: {
  status: 'loading' | 'success' | 'empty' | 'error';
  children: React.ReactNode;
  loadingLabel?: string;
  errorMessage?: string;
  emptyMessage?: string;
  onRetry?: () => void;
}) {
  if (status === 'loading') return <LoadingCard label={loadingLabel} />;
  if (status === 'error') return <ErrorCard message={errorMessage} onRetry={onRetry} />;
  if (status === 'empty') return <EmptyCard message={emptyMessage} />;
  return <>{children}</>;
}