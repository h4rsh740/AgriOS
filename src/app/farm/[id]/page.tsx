'use client';
import AppShell from '@/components/layout/AppShell';
import { DEMO_WEATHER, DEMO_SOIL, DEMO_SATELLITE, DEMO_REGENERATIVE_SCORE } from '@/lib/demo/demoData';
import Link from 'next/link';
import {
  Leaf, Satellite, CloudRain, Layers, Microscope, SlidersHorizontal,
  Repeat2, MapPin, Info, TrendingUp, TrendingDown, Minus,
  ChevronRight, Zap, Globe
} from 'lucide-react';

export default function FarmTwinPage({ params }: { params: { id: string } }) {
  const weather = DEMO_WEATHER;
  const soil = DEMO_SOIL;
  const satellite = DEMO_SATELLITE;
  const score = DEMO_REGENERATIVE_SCORE;

  const TrendIcon = satellite.trend === 'improving' ? TrendingUp : satellite.trend === 'declining' ? TrendingDown : Minus;
  const trendColor = satellite.trend === 'improving' ? 'var(--agrios-green-500)' : satellite.trend === 'declining' ? 'var(--agrios-red-400)' : 'var(--text-muted)';

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
                    <h2 style={{ color: 'white', margin: 0, fontSize: '1.4rem' }}>Demo Farm</h2>
                    <div style={{ color: 'var(--agrios-green-200)', fontSize: '0.85rem' }}>Farm Digital Twin</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {[
                    { label: 'Crop', value: 'Wheat (Triticum)' },
                    { label: 'Stage', value: 'Vegetative' },
                    { label: 'Area', value: '2.4 ha' },
                    { label: 'Location', value: 'Lucknow, Uttar Pradesh, India' },
                    { label: 'Irrigation', value: 'Drip' },
                    { label: 'Practice', value: 'Conventional' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--agrios-green-300)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-demo">Demo Data</span>
                <span className="badge badge-green">Twin Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { href: `/farm/${params.id}/weather`, icon: CloudRain, label: 'Weather', desc: `${weather.current.temperature}°C · ${weather.current.description}`, color: 'var(--agrios-sky-600)', risk: weather.risks.heatStress },
            { href: `/farm/${params.id}/satellite`, icon: Satellite, label: 'Satellite / NDVI', desc: `NDVI ${satellite.ndvi} · ${satellite.status}`, color: 'var(--agrios-sky-400)', risk: null },
            { href: `/farm/${params.id}/soil`, icon: Layers, label: 'Soil Health', desc: `pH ${soil.ph} · SOC ${soil.organicCarbon} g/kg`, color: 'var(--agrios-soil-500)', risk: null },
            { href: `/farm/${params.id}/disease`, icon: Microscope, label: 'Disease Investigator', desc: 'Upload photo for AI analysis', color: 'var(--agrios-amber-400)', risk: weather.risks.diseaseRisk },
            { href: `/farm/${params.id}/advisor`, icon: Zap, label: 'AI Advisor', desc: 'Evidence-based recommendations', color: 'var(--agrios-green-500)', risk: null },
            { href: `/farm/${params.id}/simulate`, icon: SlidersHorizontal, label: 'What-If', desc: 'Compare farming scenarios', color: 'var(--agrios-soil-700)', risk: null },
            { href: `/farm/${params.id}/regenerative`, icon: Repeat2, label: 'Regenerative Score', desc: `${score.total}/100 · ${score.categories.soilHealth.status}`, color: 'var(--agrios-green-400)', risk: null },
            { href: `/farm/${params.id}/roadmap`, icon: MapPin, label: '90-Day Roadmap', desc: 'AI regenerative action plan', color: 'var(--agrios-green-500)', risk: null },
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
              <span className="badge badge-demo" style={{ marginLeft: 'auto' }}>Demo</span>
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
              <span className="badge badge-demo" style={{ marginLeft: 'auto' }}>Demo</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'pH', value: soil.ph, note: soil.ph > 7.5 ? '⚠ Slightly alkaline' : '✓ OK' },
                { label: 'Organic Carbon', value: `${soil.organicCarbon} g/kg`, note: soil.organicCarbon < 1 ? '⚠ Low' : '✓ OK' },
                { label: 'Texture', value: 'Loam', note: '' },
                { label: 'Bulk Density', value: `${soil.bulkDensity} kg/dm³`, note: '' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '10px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.95rem' }}>{item.value}</div>
                  {item.note && <div style={{ fontSize: '0.68rem', color: item.note.includes('⚠') ? '#92400e' : 'var(--agrios-green-700)', marginTop: '2px' }}>{item.note}</div>}
                </div>
              ))}
            </div>
            <div className="data-source-label" style={{ marginTop: '12px' }}><Info size={11} /> Source: SoilGrids · Demo Data</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
