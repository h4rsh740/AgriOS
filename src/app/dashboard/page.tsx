'use client';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { DEMO_WEATHER, DEMO_SATELLITE, DEMO_ALERTS, DEMO_REGENERATIVE_SCORE } from '@/lib/demo/demoData';
import Link from 'next/link';
import {
  Leaf, CloudRain, Satellite, Layers, Microscope,
  SlidersHorizontal, Repeat2, Globe, TrendingUp, TrendingDown,
  Minus, ChevronRight, AlertTriangle, Info, Zap, BarChart3, Check
} from 'lucide-react';
import { WeatherData, SatelliteSnapshot, RegenerativeScore, FarmAlert } from '@/types';

function RiskBadge({ level }: { level: 'low' | 'moderate' | 'high' | 'critical' }) {
  const configs = {
    low: { label: 'Low', cls: 'badge-green' },
    moderate: { label: 'Moderate', cls: 'badge-amber' },
    high: { label: 'High', cls: 'badge-red' },
    critical: { label: 'Critical', cls: 'badge-red' },
  };
  const { label, cls } = configs[level];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function NDVIStatus({ ndvi, trend }: { ndvi: number; trend: string }) {
  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  const color = trend === 'improving' ? 'var(--agrios-green-500)' : trend === 'declining' ? 'var(--agrios-red-400)' : 'var(--text-muted)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 600 }}>{ndvi.toFixed(2)}</span>
      <TrendIcon size={16} color={color} />
    </div>
  );
}

function HealthCard({ icon: Icon, title, value, badge, href, color }: {
  icon: React.FC<{size?: number; color?: string}>;
  title: string;
  value: string;
  badge: string;
  badgeCls: string;
  href: string;
  color: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 36, height: 36, background: `${color}18`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={color} />
          </div>
          <ChevronRight size={14} color="var(--text-muted)" />
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{value}</div>
        </div>
        <span className={`badge ${badge}`} style={{ alignSelf: 'flex-start', fontSize: '0.68rem' }}>{badge.includes('green') ? '✓ Good' : badge.includes('amber') ? '⚠ Fair' : badge.includes('red') ? '✗ Risk' : badge}</span>
      </div>
    </Link>
  );
}

function AlertCard({ alert }: { alert: FarmAlert }) {
  const icon = alert.severity === 'critical' ? AlertTriangle : alert.severity === 'warning' ? AlertTriangle : Info;
  const Icon = icon;
  const color = alert.severity === 'critical' ? 'var(--agrios-red-600)' : alert.severity === 'warning' ? '#92400e' : 'var(--agrios-sky-600)';
  const bg = alert.severity === 'critical' ? 'var(--agrios-red-100)' : alert.severity === 'warning' ? 'var(--agrios-amber-100)' : 'var(--agrios-sky-100)';

  return (
    <div style={{ display: 'flex', gap: '12px', padding: '14px', background: bg, borderRadius: 'var(--radius-md)', border: `1px solid ${color}30` }}>
      <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: '1px' }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color, marginBottom: '4px' }}>{alert.title}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{alert.message}</div>
        <div style={{ fontSize: '0.75rem', color, marginTop: '8px', fontWeight: 500 }}>
          → {alert.recommendedAction}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const weather: WeatherData = DEMO_WEATHER;
  const satellite: SatelliteSnapshot = DEMO_SATELLITE;
  const score: RegenerativeScore = DEMO_REGENERATIVE_SCORE;
  const alerts: FarmAlert[] = DEMO_ALERTS;

  const firstName = user?.displayName?.split(' ')[0] || 'Farmer';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppShell>
      <div style={{ padding: '28px', background: 'var(--surface-muted)', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{greeting}, {firstName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Demo Farm · Wheat · Lucknow, India · 2.4 ha</span>
              <span className="badge badge-demo">Demo Data</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/onboarding" className="btn btn-outline btn-sm">+ Add Real Farm</Link>
            <Link href="/farm/demo-farm-001" className="btn btn-primary btn-sm">Open Farm Twin</Link>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        )}

        {/* Health Cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <HealthCard icon={Leaf} title="Crop Health" value="72 / 100" badge="badge-green" badgeCls="badge-green" href="/farm/demo-farm-001" color="var(--agrios-green-500)" />
          <HealthCard icon={Layers} title="Soil Health" value="pH 7.8" badge="badge-amber" badgeCls="badge-amber" href="/farm/demo-farm-001/soil" color="var(--agrios-soil-500)" />
          <HealthCard icon={CloudRain} title="Water Risk" value="Low" badge="badge-green" badgeCls="badge-green" href="/farm/demo-farm-001/weather" color="var(--agrios-sky-600)" />
          <HealthCard icon={AlertTriangle} title="Disease Risk" value="Moderate" badge="badge-amber" badgeCls="badge-amber" href="/farm/demo-farm-001/disease" color="var(--agrios-amber-400)" />
          <HealthCard icon={Repeat2} title="Regen Score" value="71 / 100" badge="badge-green" badgeCls="badge-green" href="/farm/demo-farm-001/regenerative" color="var(--agrios-green-400)" />
          <HealthCard icon={Satellite} title="NDVI Signal" value="0.58" badge="badge-green" badgeCls="badge-green" href="/farm/demo-farm-001/satellite" color="var(--agrios-sky-400)" />
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* AI Insight */}
          <div className="card card-dark">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Zap size={16} color="var(--agrios-green-300)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>AgriOS Intelligence</span>
              <span className="badge badge-dark" style={{ marginLeft: 'auto' }}>Live</span>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', lineHeight: 1.8, marginBottom: '16px' }}>
              Your wheat field is in vegetative stage with a stable vegetation signal (NDVI 0.58). Rainfall is expected in 36-48 hours — delay irrigation. Elevated humidity (72%) creates conditions favorable for fungal disease — inspect lower leaves tomorrow morning.
            </p>

            {/* Confidence */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--agrios-green-300)', fontWeight: 700 }}>81%</span>
              </div>
              <div className="confidence-bar">
                <div className="confidence-bar-fill" style={{ width: '81%', background: 'var(--agrios-green-400)' }} />
              </div>
            </div>

            {/* Evidence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {[
                { dot: 'dot-amber', text: 'Humidity 72% — above fungal risk threshold' },
                { dot: 'dot-blue', text: 'NDVI 0.58 — within normal range' },
                { dot: 'dot-green', text: '8mm rainfall forecast in 36-48 hours' },
              ].map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={`dot ${e.dot}`} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>{e.text}</span>
                </div>
              ))}
            </div>

            <Link href="/farm/demo-farm-001/advisor" className="btn btn-outline btn-sm" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--agrios-green-300)', width: '100%', justifyContent: 'center' }}>
              Full AI Analysis <ChevronRight size={14} />
            </Link>
          </div>

          {/* NDVI Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Satellite size={16} color="var(--agrios-sky-600)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem' }}>Vegetation Signal</span>
            </div>
            <NDVIStatus ndvi={satellite.ndvi} trend={satellite.trend} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>NDVI — Normalized Difference Vegetation Index</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Status', value: '✓ Healthy' },
                { label: 'Trend', value: `≈ Stable (${satellite.trendValue.toFixed(2)})` },
                { label: 'Range', value: `${satellite.ndviMin.toFixed(2)}–${satellite.ndviMax.toFixed(2)}` },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-muted)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="data-source-label"><Info size={11} /> Source: Sentinel-2 / GEE · Demo Data</div>
            <Link href="/farm/demo-farm-001/satellite" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>View Details</Link>
          </div>

          {/* Weather Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CloudRain size={16} color="var(--agrios-sky-600)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem' }}>Weather</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 600, lineHeight: 1 }}>{weather.current.temperature}</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '4px' }}>°C</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {weather.current.description} · Feels {weather.current.apparentTemperature}°C
            </div>

            {/* Risk chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              <RiskBadge level={weather.risks.diseaseRisk} />
              <span className="badge badge-blue">Rain in 36h</span>
            </div>

            {/* 5-day mini forecast */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {weather.forecast.slice(0, 5).map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '6px 2px', background: 'var(--surface-muted)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {new Date(d.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: d.precipitation > 5 ? 'var(--agrios-sky-600)' : 'var(--text-secondary)', marginTop: '2px' }}>
                    {d.maxTemp}°
                  </div>
                  {d.precipitation > 0 && <div style={{ fontSize: '0.6rem', color: 'var(--agrios-sky-600)' }}>{d.precipitation}mm</div>}
                </div>
              ))}
            </div>

            <div className="data-source-label"><Info size={11} /> Source: Open-Meteo · Demo Data</div>
            <Link href="/farm/demo-farm-001/weather" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>7-Day Forecast</Link>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {/* Today's Actions */}
          <div className="card" style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Check size={16} color="var(--agrios-green-500)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem' }}>Today&apos;s Actions</span>
            </div>
            {[
              { priority: 'high', text: 'Inspect lower leaves for fungal symptoms' },
              { priority: 'medium', text: 'Delay irrigation 24-36 hours' },
              { priority: 'medium', text: 'Check drainage infrastructure' },
              { priority: 'low', text: 'Monitor NDVI trend next week' },
            ].map((action, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', paddingBottom: '12px', borderBottom: i < 3 ? '1px solid var(--border-muted)' : 'none' }}>
                <div className={`dot ${action.priority === 'high' ? 'dot-red' : action.priority === 'medium' ? 'dot-amber' : 'dot-green'}`} style={{ marginTop: '4px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', lineHeight: 1.5, flex: 1 }}>{action.text}</span>
              </div>
            ))}
            <Link href="/farm/demo-farm-001/advisor" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Full Advisor</Link>
          </div>

          {/* Regen Score */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Repeat2 size={16} color="var(--agrios-green-500)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem' }}>Regenerative Index</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              {/* Circle score */}
              <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border-muted)" strokeWidth="7" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--agrios-green-500)" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - score.total / 100)}`} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1, color: 'var(--agrios-green-700)' }}>{score.total}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>/100</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--agrios-green-700)', marginBottom: '4px' }}>AgriOS Regenerative Index</div>
                <span className="badge badge-green">Good</span>
              </div>
            </div>

            {/* Category bars */}
            {Object.entries(score.categories).slice(0, 4).map(([key, cat]) => (
              <div key={key} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cat.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{cat.score}</span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-bar-fill" style={{
                    width: `${cat.score}%`,
                    background: cat.score >= 70 ? 'var(--agrios-green-400)' : cat.score >= 50 ? 'var(--agrios-amber-400)' : 'var(--agrios-red-400)',
                  }} />
                </div>
              </div>
            ))}
            <Link href="/farm/demo-farm-001/regenerative" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>Full Analysis</Link>
          </div>

          {/* Quick Nav */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>Quick Access</div>
            {[
              { href: '/farm/demo-farm-001/disease', icon: Microscope, label: 'Investigate Disease', color: 'var(--agrios-amber-400)', desc: 'Upload crop photo' },
              { href: '/farm/demo-farm-001/simulate', icon: SlidersHorizontal, label: 'What-If Simulator', color: 'var(--agrios-soil-500)', desc: 'Compare scenarios' },
              { href: '/farm/demo-farm-001/roadmap', icon: BarChart3, label: '90-Day Roadmap', color: 'var(--agrios-green-500)', desc: 'AI-generated plan' },
              { href: '/agrimesh', icon: Globe, label: 'AgriMesh', color: 'var(--agrios-sky-600)', desc: 'BRICS cooperation' },
            ].map((item, i) => (
              <Link key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', textDecoration: 'none', marginBottom: '4px', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 36, height: 36, background: `${item.color}15`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={18} color={item.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <ChevronRight size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
