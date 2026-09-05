'use client';
// ============================================================
// AgriOS — Farm Digital Twin (overview)
// Loads the full farm context via useFarmContext (weather,
// soil, satellite — each with independent demo fallback) and
// renders Loading / Error / Demo states via DataState.
// ============================================================
import AppShell from '@/components/layout/AppShell';
import { use } from 'react';
import Link from 'next/link';
import {
  Leaf, Satellite, CloudRain, Layers, Microscope, SlidersHorizontal,
  Repeat2, MapPin, Info, TrendingUp, TrendingDown, Minus,
  ChevronRight, Zap, Globe, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { useFarmContext } from '@/hooks/useFarmContext';
import { DEMO_WEATHER, DEMO_SOIL, DEMO_SATELLITE, DEMO_REGENERATIVE_SCORE } from '@/lib/demo/demoData';
import { LoadingCard, ErrorCard, DemoBadge } from '@/components/ui/DataState';
import HistoricalPriceTrendsCard from '@/components/dashboard/HistoricalPriceTrendsCard';
import RegionalPeerFarmsCard from '@/components/dashboard/RegionalPeerFarmsCard';
import { getAgroClimaticZone, getFAOSTATBenchmark } from '@/lib/services/agriculture/geospatialService';

export default function FarmTwinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: farmId } = use(params);
  const { ctx, loading, error, refresh } = useFarmContext(farmId);

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: '28px' }}>
          <LoadingCard label="Loading your farm twin…" sublabel="Fetching weather, soil, and satellite context" />
        </div>
      </AppShell>
    );
  }

  if (error || !ctx) {
    return (
      <AppShell>
        <div style={{ padding: '28px' }}>
          <ErrorCard message={error || 'Farm context could not be loaded.'} onRetry={refresh} />
        </div>
      </AppShell>
    );
  }

  const { farm } = ctx;
  const weather = ctx.weather ?? DEMO_WEATHER;
  const soil = ctx.soil ?? DEMO_SOIL;
  const satellite = ctx.satellite ?? DEMO_SATELLITE;
  const score = ctx.regenerativeScore ?? DEMO_REGENERATIVE_SCORE;

  const TrendIcon = satellite.trend === 'improving' ? TrendingUp : satellite.trend === 'declining' ? TrendingDown : Minus;
  const trendColor = satellite.trend === 'improving' ? 'var(--agrios-green-500)' : satellite.trend === 'declining' ? 'var(--agrios-red-400)' : 'var(--text-muted)';

  // Derive USDA-style texture class from SoilGrids sand/silt/clay percentages.
  const soilTexture = (() => {
    const { sand, silt, clay } = soil;
    if (clay >= 40) return 'Clay';
    if (sand >= 70) return 'Sandy';
    if (silt >= 70) return 'Silty';
    if (clay >= 25 && silt >= 40) return 'Clay Loam';
    return 'Loam';
  })();

  const locLabel = [farm.location.address, farm.location.state, farm.location.country].filter(Boolean).join(', ') || `${farm.location.lat.toFixed(3)}, ${farm.location.lng.toFixed(3)}`;

  return (
    <AppShell>
      <div style={{ padding: '28px', minHeight: '100vh' }}>
        {/* Farm Header */}
        <div style={{ background: 'var(--agrios-green-800)', borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(45,155,90,0.15) 0%, transparent 60%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--agrios-green-500)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Leaf size={22} color="white" />
                  </div>
                  <div>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '1.4rem' }}>{farm.name}</h2>
                    <div style={{ color: 'var(--agrios-green-200)', fontSize: '0.85rem' }}>Farm Digital Twin</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {[
                    { label: 'Crop', value: farm.crop },
                    { label: 'Stage', value: farm.cropStage.replace('_', ' ') },
                    { label: 'Area', value: `${farm.areaHa} ha` },
                    { label: 'Location', value: locLabel },
                    { label: 'Irrigation', value: farm.irrigationType },
                    { label: 'Practice', value: farm.farmingPractice },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--agrios-green-300)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={refresh}
                  style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                  title="Reload farm context"
                >
                  <RefreshCw size={13} /> Refresh
                </button>
                {ctx.isDemo && <DemoBadge note="Demo Data" />}
                <span className="badge badge-green">Twin Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active alerts (best-effort) */}
        {ctx.alerts && ctx.alerts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {ctx.alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem',
                background: alert.severity === 'critical' ? 'var(--agrios-red-100)' : alert.severity === 'warning' ? 'var(--agrios-amber-100)' : 'var(--surface-muted)',
                border: `1px solid ${alert.severity === 'critical' ? 'var(--agrios-red-400)' : alert.severity === 'warning' ? 'var(--agrios-amber-400)' : 'var(--border-default)'}`,
              }}>
                <AlertTriangle size={15} color={alert.severity === 'critical' ? 'var(--agrios-red-600)' : '#92400e'} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ textTransform: 'capitalize' }}>{alert.type.replace('_', ' ')}</strong> — {alert.message}
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>{alert.recommendedAction}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { href: `/farm/${farmId}/weather`, icon: CloudRain, label: 'Weather', desc: `${weather.current.temperature}°C · ${weather.current.description}`, color: 'var(--agrios-sky-600)', risk: weather.risks.heatStress },
            { href: `/farm/${farmId}/satellite`, icon: Satellite, label: 'Satellite / NDVI', desc: `NDVI ${satellite.ndvi} · ${satellite.status}`, color: 'var(--agrios-sky-400)', risk: null },
            { href: `/farm/${farmId}/soil`, icon: Layers, label: 'Soil Health', desc: `pH ${soil.ph} · SOC ${soil.organicCarbon} g/kg`, color: 'var(--agrios-soil-500)', risk: null },
            { href: `/farm/${farmId}/disease`, icon: Microscope, label: 'Disease Investigator', desc: 'Upload photo for AI analysis', color: 'var(--agrios-amber-400)', risk: weather.risks.diseaseRisk },
            { href: `/farm/${farmId}/advisor`, icon: Zap, label: 'AI Advisor', desc: 'Evidence-based recommendations', color: 'var(--agrios-green-500)', risk: null },
            { href: `/farm/${farmId}/simulate`, icon: SlidersHorizontal, label: 'What-If', desc: 'Compare farming scenarios', color: 'var(--agrios-soil-700)', risk: null },
            { href: `/farm/${farmId}/regenerative`, icon: Repeat2, label: 'Regenerative Score', desc: `${score.total}/100 · ${score.categories.soilHealth.status}`, color: 'var(--agrios-green-400)', risk: null },
            { href: `/farm/${farmId}/roadmap`, icon: MapPin, label: '90-Day Roadmap', desc: 'AI regenerative action plan', color: 'var(--agrios-green-500)', risk: null },
            { href: '/agrimesh', icon: Globe, label: 'AgriMesh', desc: 'BRICS knowledge exchange', color: 'var(--agrios-sky-600)', risk: null },
          ].map((tile, i) => (
            <Link key={i} href={tile.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 42, height: 42, background: `${tile.color}18`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <tile.icon size={20} color={tile.color} />
                  </div>
                  {tile.risk && tile.risk !== 'low' && (
                    <span className={`badge ${tile.risk === 'high' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>{tile.risk}</span>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>{tile.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tile.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: tile.color, fontSize: '0.78rem', fontWeight: 600, gap: '4px' }}>
                  Open <ChevronRight size={13} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* NDVI + Soil summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Satellite size={16} color="var(--agrios-sky-400)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem' }}>Current Vegetation Signal</span>
              {satellite.isDemo && <DemoBadge style={{ marginLeft: 'auto' }} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 600, color: 'var(--agrios-green-600)', lineHeight: 1 }}>{satellite.ndvi.toFixed(2)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>NDVI</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <TrendIcon size={16} color={trendColor} />
                  <span style={{ fontSize: '0.85rem', color: trendColor, fontWeight: 600, textTransform: 'capitalize' }}>{satellite.trend}</span>
                </div>
                <span className="badge badge-green">{satellite.status}</span>
                <div className="data-source-label" style={{ marginTop: '8px' }}><Info size={11} /> {satellite.source}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Layers size={16} color="var(--agrios-soil-500)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem' }}>Soil Profile</span>
              {soil.isDemo && <DemoBadge style={{ marginLeft: 'auto' }} />}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'pH', value: soil.ph, note: soil.ph > 7.5 ? '⚠ Slightly alkaline' : '✓ OK' },
                { label: 'Organic Carbon', value: `${soil.organicCarbon} g/kg`, note: soil.organicCarbon < 1 ? '⚠ Low' : '✓ OK' },
                { label: 'Texture', value: soilTexture, note: '' },
                { label: 'Bulk Density', value: `${soil.bulkDensity} kg/dm³`, note: '' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '10px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.95rem' }}>{item.value}</div>
                  {item.note && <div style={{ fontSize: '0.68rem', color: item.note.includes('⚠') ? '#92400e' : 'var(--agrios-green-700)', marginTop: '2px' }}>{item.note}</div>}
                </div>
              ))}
            </div>
            <div className="data-source-label" style={{ marginTop: '12px' }}><Info size={11} /> Source: {soil.source === 'demo' ? 'Demo Data' : 'SoilGrids'}</div>
          </div>
        </div>

        {/* BigQuery Historical Mandi Analytics */}
        <HistoricalPriceTrendsCard crop={farm.crop} state={farm.location.state} />

        {/* Regional Peer Farms & Cohort Benchmarking */}
        <RegionalPeerFarmsCard farmId={farm.id} crop={farm.crop} state={farm.location.state} practice={farm.farmingPractice} />

        {/* ICAR Agro-Climatic Zone & FAOSTAT Benchmark Layer */}
        {(() => {
          const agroZone = getAgroClimaticZone(farm.location.state);
          const faoBenchmark = getFAOSTATBenchmark(farm.crop);
          return (
            <div className="card" style={{ marginTop: '24px', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={18} color="var(--agrios-green-600)" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                    ICAR Agro-Climatic Zoning & FAOSTAT Benchmark Layer
                  </h3>
                </div>
                <span className="badge badge-soil" style={{ fontSize: '0.65rem' }}>
                  Zone {agroZone.zoneNumber}: {agroZone.zoneName}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Agro-Climatic Zone Details */}
                <div style={{ background: 'var(--surface-muted)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--agrios-green-700)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    National Agro-Climatic Context (ICAR / Planning Commission)
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{agroZone.zoneName}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                    <div><strong>Climate:</strong> {agroZone.climateClassification}</div>
                    <div><strong>Precipitation Range:</strong> {agroZone.annualRainfallRangeMm[0]}–{agroZone.annualRainfallRangeMm[1]} mm/year</div>
                    <div><strong>Major Soil Order:</strong> {agroZone.majorSoilTypes.join(', ')}</div>
                    <div><strong>Research Hub:</strong> {agroZone.icarResearchCenter}</div>
                  </div>
                  <div className="data-source-label" style={{ fontSize: '0.68rem' }}>
                    <Info size={11} /> {agroZone.isroBhuvanTheme}
                  </div>
                </div>

                {/* FAOSTAT Yield Benchmark & Gap */}
                <div style={{ background: 'var(--surface-muted)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--agrios-sky-600)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    FAOSTAT Global Yield Gap Analysis ({faoBenchmark.crop})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ padding: '8px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>National Avg</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{faoBenchmark.nationalAverageYieldQHa} q/ha</div>
                    </div>
                    <div style={{ padding: '8px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Global Avg</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{faoBenchmark.globalAverageYieldQHa} q/ha</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                    <div><strong>Leading Benchmark:</strong> {faoBenchmark.topProducingNation.country} ({faoBenchmark.topProducingNation.averageYieldQHa} q/ha)</div>
                    <div><strong>Estimated Yield Gap:</strong> {faoBenchmark.potentialYieldGapPercent}% recoverable with precision nutrient & irrigation management.</div>
                  </div>
                  <div className="data-source-label" style={{ fontSize: '0.68rem' }}>
                    <Info size={11} /> Source: {faoBenchmark.sourceDataset} ({faoBenchmark.reportingYear})
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </AppShell>
  );
}

