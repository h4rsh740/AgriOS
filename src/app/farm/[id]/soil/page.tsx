'use client';
import AppShell from '@/components/layout/AppShell';
import { use } from 'react';
import { useFarmContext } from '@/hooks/useFarmContext';
import { DEMO_SOIL } from '@/lib/demo/demoData';
import { Layers, Info, RefreshCw } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { LoadingCard, ErrorCard, DemoBadge } from '@/components/ui/DataState';

export default function SoilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: farmId } = use(params);
  const { ctx, loading, error, refresh } = useFarmContext(farmId);

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: '28px' }}>
          <LoadingCard label="Loading soil profile…" sublabel="Querying SoilGrids depth layers" />
        </div>
      </AppShell>
    );
  }

  if (error || !ctx) {
    return (
      <AppShell>
        <div style={{ padding: '28px' }}>
          <ErrorCard message={error || 'Could not load soil profile'} onRetry={refresh} />
        </div>
      </AppShell>
    );
  }

  const soil = ctx.soil || DEMO_SOIL;
  const locationText = [ctx.farm.location.district, ctx.farm.location.state, ctx.farm.location.country]
    .filter(Boolean).join(', ') || `${ctx.farm.location.lat.toFixed(2)}, ${ctx.farm.location.lng.toFixed(2)}`;

  const totalTexture = soil.sand + soil.silt + soil.clay;
  const sandPct = ((soil.sand / totalTexture) * 100).toFixed(0);
  const siltPct = ((soil.silt / totalTexture) * 100).toFixed(0);
  const clayPct = ((soil.clay / totalTexture) * 100).toFixed(0);

  const radarData = [
    { metric: 'pH Balance', value: soil.ph > 8.5 ? 20 : soil.ph < 5.5 ? 20 : soil.ph > 7.5 ? 55 : soil.ph > 6.5 ? 90 : 75 },
    { metric: 'Organic Carbon', value: Math.min(100, (soil.organicCarbon / 2) * 100) },
    { metric: 'Texture', value: 70 },
    { metric: 'Bulk Density', value: soil.bulkDensity < 1.2 ? 85 : soil.bulkDensity < 1.5 ? 65 : 40 },
    { metric: 'Biology Potential', value: soil.organicCarbon > 1.5 ? 80 : soil.organicCarbon > 1.0 ? 60 : soil.organicCarbon > 0.5 ? 40 : 25 },
    { metric: 'Water Retention', value: parseInt(clayPct) > 30 ? 75 : parseInt(siltPct) > 30 ? 65 : 50 },
  ];

  const phStatus = soil.ph < 5.5 ? { label: 'Acidic', color: 'var(--agrios-red-400)' } :
    soil.ph < 6.5 ? { label: 'Slightly Acidic', color: 'var(--agrios-amber-400)' } :
    soil.ph < 7.5 ? { label: 'Neutral', color: 'var(--agrios-green-500)' } :
    soil.ph < 8.5 ? { label: 'Slightly Alkaline', color: 'var(--agrios-amber-400)' } :
    { label: 'Alkaline', color: 'var(--agrios-red-400)' };

  return (
    <AppShell>
      <div style={{ padding: '28px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={22} color="var(--agrios-soil-500)" />
            <h2 style={{ margin: 0 }}>Soil Health Profile</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={refresh} className="btn btn-outline btn-sm" title="Refresh soil data">
              <RefreshCw size={13} /> Refresh
            </button>
            {soil.isDemo ? <DemoBadge note="Demo Data · SoilGrids" /> : <span className="badge badge-green">SoilGrids Live</span>}
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.875rem' }}>
          {ctx.farm.name} ({locationText}) · 0-30cm depth
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Key indicators */}
          <div>
            {/* pH Card */}
            <div className="card" style={{ marginBottom: '16px', borderLeft: `4px solid ${phStatus.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Soil pH</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 600, lineHeight: 1, color: phStatus.color }}>{soil.ph}</div>
                </div>
                <span className="badge badge-amber" style={{ textTransform: 'capitalize' }}>{phStatus.label}</span>
              </div>

              {/* pH scale */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ height: 12, borderRadius: '6px', background: 'linear-gradient(to right, #ef4444 0%, #fb923c 15%, #fbbf24 25%, #84cc16 35%, #22c55e 50%, #86efac 65%, #fbbf24 78%, #fb923c 90%, #ef4444 100%)', position: 'relative', marginBottom: '4px' }}>
                  <div style={{
                    position: 'absolute', top: '-2px', bottom: '-2px', width: '4px', borderRadius: '2px',
                    left: `${((soil.ph - 3) / 11) * 100}%`, background: 'white', border: '2px solid var(--text-primary)',
                    transform: 'translateX(-50%)',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  <span>3.0 Acid</span><span>5.5</span><span>6.5</span><span>7.5</span><span>8.5</span><span>14.0 Alkaline</span>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                pH {soil.ph} is slightly alkaline. This can reduce availability of phosphorus, iron, manganese and zinc. Consider soil amendment to bring pH toward 6.5–7.0 for wheat.
              </p>
            </div>

            {/* SOC */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Soil Organic Carbon (SOC)</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 600, color: 'var(--agrios-soil-700)', lineHeight: 1 }}>{soil.organicCarbon}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '3px' }}>g/kg</span>
                <span className="badge badge-amber" style={{ marginBottom: '2px' }}>Low</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target: &gt;1.0 g/kg</span>
                </div>
                <div className="confidence-bar" style={{ height: 8 }}>
                  <div className="confidence-bar-fill" style={{ width: `${Math.min(100, (soil.organicCarbon / 2) * 100)}%`, background: 'var(--agrios-soil-500)' }} />
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                Low SOC limits soil biology, water retention, and buffering capacity. Target is &gt;1.0 g/kg for healthy soil. Cover crops and compost can add 0.2-0.5 g/kg per year.
              </p>
            </div>

            {/* Texture */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>Soil Texture</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {[{ label: 'Sand', value: sandPct, color: '#fbbf24' }, { label: 'Silt', value: siltPct, color: '#a97448' }, { label: 'Clay', value: clayPct, color: '#9ca3af' }].map((t, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', padding: '12px', background: `${t.color}20`, borderRadius: 'var(--radius-md)', border: `1px solid ${t.color}40` }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.2rem', color: t.color }}>{t.value}%</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>{t.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-soil">Loam</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Good texture for wheat — balanced drainage and retention</span>
              </div>
            </div>
          </div>

          {/* Radar + details */}
          <div>
            <div className="card" style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '20px' }}>Soil Health Radar</h4>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border-muted)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <Radar dataKey="value" stroke="var(--agrios-soil-500)" fill="var(--agrios-soil-500)" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip formatter={(v) => [`${v}/100`, 'Score']} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.8rem' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="card" style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '14px' }}>Physical Properties</h4>
              {[
                { label: 'Bulk Density', value: `${soil.bulkDensity} kg/dm³`, note: 'Normal range 1.0-1.6', ok: soil.bulkDensity <= 1.5 },
                { label: 'Sand Content', value: `${soil.sand} g/kg`, note: `${sandPct}% of texture`, ok: true },
                { label: 'Silt Content', value: `${soil.silt} g/kg`, note: `${siltPct}% of texture`, ok: true },
                { label: 'Clay Content', value: `${soil.clay} g/kg`, note: `${clayPct}% of texture`, ok: true },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-muted)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.note}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.9rem' }}>{item.value}</span>
                    <span className={`badge ${item.ok ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.6rem' }}>{item.ok ? '✓' : '⚠'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="data-source-label"><Info size={12} /> Source: SoilGrids REST API (ISRIC) · 0-30cm depth · Demo Data</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
