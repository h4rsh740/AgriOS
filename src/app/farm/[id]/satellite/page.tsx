'use client';
import AppShell from '@/components/layout/AppShell';
import { use } from 'react';
import { useFarmContext } from '@/hooks/useFarmContext';
import { DEMO_SATELLITE } from '@/lib/demo/demoData';
import { Satellite, TrendingUp, TrendingDown, Minus, Info, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { LoadingCard, ErrorCard, DemoBadge } from '@/components/ui/DataState';

// Realistic NDVI trend (last 8 weeks)
const NDVI_HISTORY = [
  { week: 'W-8', ndvi: 0.42, date: '7 Jul' }, { week: 'W-7', ndvi: 0.47, date: '14 Jul' },
  { week: 'W-6', ndvi: 0.51, date: '21 Jul' }, { week: 'W-5', ndvi: 0.54, date: '28 Jul' },
  { week: 'W-4', ndvi: 0.57, date: '4 Aug' }, { week: 'W-3', ndvi: 0.61, date: '11 Aug' },
  { week: 'W-2', ndvi: 0.60, date: '18 Aug' }, { week: 'W-1', ndvi: 0.58, date: '25 Aug' },
  { week: 'Now', ndvi: 0.58, date: '2 Sep' },
];

export default function SatellitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: farmId } = use(params);
  const { ctx, loading, error, refresh } = useFarmContext(farmId);

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: '28px' }}>
          <LoadingCard label="Loading satellite observation…" sublabel="Querying Sentinel-2 / Google Earth Engine" />
        </div>
      </AppShell>
    );
  }

  if (error || !ctx) {
    return (
      <AppShell>
        <div style={{ padding: '28px' }}>
          <ErrorCard message={error || 'Could not load satellite data'} onRetry={refresh} />
        </div>
      </AppShell>
    );
  }

  const sat = ctx.satellite || DEMO_SATELLITE;
  const TrendIcon = sat.trend === 'improving' ? TrendingUp : sat.trend === 'declining' ? TrendingDown : Minus;
  const trendColor = sat.trend === 'improving' ? 'var(--agrios-green-500)' : sat.trend === 'declining' ? 'var(--agrios-red-400)' : 'var(--text-muted)';

  return (
    <AppShell>
      <div style={{ padding: '28px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Satellite size={22} color="var(--agrios-sky-400)" />
            <h2 style={{ margin: 0 }}>Satellite Vegetation Intelligence</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={refresh} className="btn btn-outline btn-sm" title="Refresh satellite observations">
              <RefreshCw size={13} /> Refresh
            </button>
            {sat.isDemo ? <DemoBadge note="Demo Data · GEE" /> : <span className="badge badge-green">Sentinel-2 Live</span>}
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.875rem' }}>
          {ctx.farm.name} · Sentinel-2 NDVI via Google Earth Engine · Updated weekly
        </p>

        {/* Key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ borderTop: '3px solid var(--agrios-green-500)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current NDVI</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 600, color: 'var(--agrios-green-600)', lineHeight: 1 }}>{sat.ndvi.toFixed(2)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Normalized Difference Vegetation Index</div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>7-Day Trend</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendIcon size={24} color={trendColor} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 600, color: trendColor }}>{sat.trendValue > 0 ? '+' : ''}{sat.trendValue.toFixed(2)}</span>
            </div>
            <span className="badge badge-green" style={{ marginTop: '6px' }}>Stable</span>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Field Range</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 600, lineHeight: 1 }}>
              {sat.ndviMin.toFixed(2)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>–</span>{sat.ndviMax.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Min–Max across farm boundary</div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Health Status</div>
            <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>✓ Healthy</span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>NDVI 0.58 indicates adequate vegetation</div>
          </div>
        </div>

        {/* NDVI Scale */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '16px' }}>NDVI Interpretation Scale</h4>
          <div style={{ position: 'relative', height: '36px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', background: 'linear-gradient(to right, #ef4444 0%, #f97316 20%, #fbbf24 40%, #84cc16 65%, #22c55e 80%, #166534 100%)' }}>
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: `${sat.ndvi * 100}%`,
              width: '3px', background: 'white', boxShadow: '0 0 6px rgba(0,0,0,0.5)',
              transform: 'translateX(-50%)',
            }} />
            <div style={{
              position: 'absolute', top: '-24px', left: `${sat.ndvi * 100}%`,
              transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--agrios-green-700)',
            }}>
              ↓ {sat.ndvi.toFixed(2)}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>0.0 — Bare / Stressed</span>
            <span>0.3 — Sparse</span>
            <span>0.5 — Moderate</span>
            <span>0.7 — Dense</span>
            <span>1.0 — Max</span>
          </div>
        </div>

        {/* Trend chart */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '20px' }}>8-Week NDVI Trend</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={NDVI_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis domain={[0.3, 0.8]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <ReferenceLine y={0.5} stroke="var(--agrios-amber-400)" strokeDasharray="4 4" label={{ value: 'Threshold', fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip
                formatter={(v) => [Number(v).toFixed(2), 'NDVI']}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.8rem' }}
              />
              <Line type="monotone" dataKey="ndvi" stroke="var(--agrios-green-500)" strokeWidth={2.5} dot={{ fill: 'var(--agrios-green-500)', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interpretation */}
        <div className="card card-tinted">
          <h4 style={{ marginBottom: '14px' }}>Agronomic Interpretation</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '12px' }}>
            Current NDVI of <strong>0.58</strong> indicates your wheat crop has adequate green biomass for the vegetative stage. The slight decline from the peak of 0.61 (11 Aug) may reflect natural variation or early canopy closure rather than stress.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
            Given the elevated humidity (72%), monitoring NDVI over the next 7-10 days is recommended. A decline below <strong>0.50</strong> during vegetative stage would be a concern warranting field investigation.
          </p>
          <div className="data-source-label"><Info size={12} /> Source: Sentinel-2 / Google Earth Engine · 10-day composite · Demo Data</div>
        </div>
      </div>
    </AppShell>
  );
}
