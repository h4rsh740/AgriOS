'use client';
// ============================================================
// AgriOS — Farmer Command Center (Dashboard)
// Dynamic farm switching, real weather telemetry, Mandi APMC prices,
// government scheme matching, AI intelligence, and voice assistant.
// ============================================================
import AppShell from '@/components/layout/AppShell';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DEMO_FARM, DEMO_WEATHER, DEMO_SATELLITE, DEMO_REGENERATIVE_SCORE, DEMO_ALERTS } from '@/lib/demo/demoData';
import Link from 'next/link';
import {
  Leaf, CloudRain, Satellite, Layers, Microscope,
  SlidersHorizontal, Repeat2, TrendingUp,
  ChevronRight, AlertTriangle, Info, Zap, Check,
  Mic, ShoppingBag, Award, Building
} from 'lucide-react';
import { Farm, WeatherData, SatelliteSnapshot, RegenerativeScore, FarmAlert } from '@/types';
import { MarketIntelligenceResponse } from '@/lib/services/agriculture/marketService';
import { GovernmentScheme } from '@/lib/services/agriculture/schemeService';
import VoiceAssistant from '@/components/voice/VoiceAssistant';

function HealthCard({ icon: Icon, title, value, badge, badgeCls, href, color }: {
  icon: React.FC<{ size?: number; color?: string }>;
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
        <span className={`badge ${badgeCls}`} style={{ alignSelf: 'flex-start', fontSize: '0.68rem' }}>{badge}</span>
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
        {alert.recommendedAction && (
          <div style={{ fontSize: '0.75rem', color, marginTop: '6px', fontWeight: 600 }}>
            → {alert.recommendedAction}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([DEMO_FARM]);
  const [activeFarmId, setActiveFarmId] = useState<string>(DEMO_FARM.id);
  const [weather, setWeather] = useState<WeatherData>(DEMO_WEATHER);
  const [market, setMarket] = useState<MarketIntelligenceResponse | null>(null);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [alerts, setAlerts] = useState<FarmAlert[]>(DEMO_ALERTS);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Active farm entity
  const activeFarm = useMemo(() => {
    return farms.find(f => f.id === activeFarmId) || farms[0] || DEMO_FARM;
  }, [farms, activeFarmId]);

  // Load farms on mount
  useEffect(() => {
    async function loadFarms() {
      const list: Farm[] = [];
      if (user?.uid) {
        try {
          const { getUserFarms } = await import('@/lib/firebase/firestore');
          const remotes = await getUserFarms(user.uid);
          if (remotes && remotes.length > 0) list.push(...remotes);
        } catch { /* offline */ }
      }

      if (typeof window !== 'undefined') {
        try {
          const local = JSON.parse(localStorage.getItem('agrios_local_farms') || '[]');
          for (const lf of local) {
            if (!list.some(f => f.id === lf.id)) list.push(lf);
          }
        } catch { /* ignored */ }
      }

      if (!list.some(f => f.id === DEMO_FARM.id)) list.push(DEMO_FARM);
      setFarms(list);
      if (list.length > 0 && list[0].id !== DEMO_FARM.id) {
        setActiveFarmId(list[0].id);
      }
    }
    void loadFarms();
  }, [user]);

  // Refresh data whenever activeFarm changes
  useEffect(() => {
    async function refreshFarmData() {
      setLoading(true);
      const lat = activeFarm.location.lat;
      const lng = activeFarm.location.lng;

      // 1. Weather
      try {
        const wRes = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
        if (wRes.ok) {
          const wData = await wRes.json();
          setWeather(wData);
        }
      } catch { /* keep demo */ }

      // 2. Mandi Prices
      try {
        const mRes = await fetch(`/api/market/prices?crop=${encodeURIComponent(activeFarm.crop)}&state=${encodeURIComponent(activeFarm.location.state || '')}`);
        if (mRes.ok) {
          const mData = await mRes.json();
          setMarket(mData);
        }
      } catch { /* keep fallback */ }

      // 3. Government Schemes
      try {
        const sRes = await fetch('/api/schemes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activeFarm),
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.schemes) setSchemes(sData.schemes);
        }
      } catch { /* keep fallback */ }

      // 4. Alerts
      try {
        const aRes = await fetch(`/api/alerts?farmId=${activeFarm.id}&lat=${lat}&lng=${lng}`);
        if (aRes.ok) {
          const aData = await aRes.json();
          if (aData.alerts && aData.alerts.length > 0) setAlerts(aData.alerts);
        }
      } catch { /* keep fallback */ }

      setLoading(false);
    }

    void refreshFarmData();
  }, [activeFarm]);

  const firstName = user?.displayName?.split(' ')[0] || 'Farmer';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const satellite: SatelliteSnapshot = DEMO_SATELLITE;
  const score: RegenerativeScore = DEMO_REGENERATIVE_SCORE;

  const farmContextForVoice = {
    farm: activeFarm,
    weather,
    soil: null,
    satellite,
    alerts,
    regenerativeScore: score,
    isDemo: weather.isDemo,
  };

  return (
    <AppShell>
      <div style={{ padding: '28px', background: 'var(--surface-muted)', minHeight: '100vh' }}>
        {/* Header with Farm Switcher & Voice Trigger */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{greeting}, {firstName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Farm switcher dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={15} color="var(--text-muted)" />
                <select
                  value={activeFarm.id}
                  onChange={e => setActiveFarmId(e.target.value)}
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.crop} · {f.location.state || 'India'})
                    </option>
                  ))}
                </select>
                {loading && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-primary-600)', animation: 'pulse 1.5s infinite' }} />
                    Syncing...
                  </span>
                )}
              </div>

              {activeFarm.id === DEMO_FARM.id ? (
                <span className="badge badge-demo">Demo Benchmark</span>
              ) : (
                <span className="badge badge-green">Real Farm Twin</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Voice Assistant Button */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, var(--agrios-green-600) 0%, var(--agrios-sky-600) 100%)',
                color: 'white',
                border: 'none',
                gap: '6px',
                padding: '6px 14px',
              }}
            >
              <Mic size={15} /> Speak to AI
            </button>

            <Link href="/onboarding" className="btn btn-outline btn-sm">+ Add Farm</Link>
            <Link href={`/farm/${activeFarm.id}`} className="btn btn-primary btn-sm">Open Twin Hub</Link>
          </div>
        </div>

        {/* Alerts banner */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.slice(0, 2).map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        )}

        {/* Health Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <HealthCard icon={Leaf} title="Crop Health" value={activeFarm.crop} badge={activeFarm.cropStage.replace('_', ' ')} badgeCls="badge-green" href={`/farm/${activeFarm.id}`} color="var(--agrios-green-500)" />
          <HealthCard icon={CloudRain} title="Live Weather" value={`${weather.current.temperature}°C`} badge={weather.isDemo ? 'Demo Weather' : 'Open-Meteo Live'} badgeCls={weather.isDemo ? 'badge-amber' : 'badge-green'} href={`/farm/${activeFarm.id}/weather`} color="var(--agrios-sky-600)" />
          <HealthCard icon={Layers} title="Soil Health" value="pH 7.8" badge="SoilGrids" badgeCls="badge-amber" href={`/farm/${activeFarm.id}/soil`} color="var(--agrios-soil-500)" />
          <HealthCard icon={AlertTriangle} title="Disease Pressure" value={weather.risks.diseaseRisk} badge="Check Canopy" badgeCls={weather.risks.diseaseRisk === 'high' ? 'badge-red' : 'badge-amber'} href={`/farm/${activeFarm.id}/disease`} color="var(--agrios-amber-400)" />
          <HealthCard icon={Satellite} title="NDVI Signal" value={satellite.ndvi.toFixed(2)} badge={satellite.status} badgeCls="badge-green" href={`/farm/${activeFarm.id}/satellite`} color="var(--agrios-sky-400)" />
          <HealthCard icon={Repeat2} title="Regen Index" value={`${score.total}/100`} badge="Good" badgeCls="badge-green" href={`/farm/${activeFarm.id}/regenerative`} color="var(--agrios-green-400)" />
        </div>

        {/* Main 3-Column Intelligence Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* AI Intelligence Brief */}
          <div className="card card-dark">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Zap size={16} color="var(--agrios-green-300)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>AgriOS Intelligence Orchestrator</span>
              <span className="badge badge-dark" style={{ marginLeft: 'auto' }}>Gemini AI</span>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '16px' }}>
              Your {activeFarm.crop} field in {activeFarm.location.state || 'your region'} is currently in the <strong>{activeFarm.cropStage.replace('_', ' ')}</strong> stage.
              Ambient temperature is {weather.current.temperature}°C with humidity at {weather.current.humidity}%.
              {weather.forecast.slice(0, 3).reduce((s, d) => s + d.precipitation, 0) > 5
                ? ' Upcoming rainfall within 72 hours suggests delaying irrigation to prevent root hypoxia.'
                : ' Soil moisture depletion is steady; proceed with standard irrigation cycle.'}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>Evidence Confidence</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--agrios-green-300)', fontWeight: 700 }}>82%</span>
              </div>
              <div className="confidence-bar">
                <div className="confidence-bar-fill" style={{ width: '82%', background: 'var(--agrios-green-400)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="dot dot-green" />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Open-Meteo: {weather.current.description}, wind {weather.current.windSpeed} km/h</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="dot dot-amber" />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Disease Risk: {weather.risks.diseaseRisk} based on temperature & humidity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="dot dot-blue" />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Vegetation index: NDVI {satellite.ndvi.toFixed(2)} ({satellite.trend})</span>
              </div>
            </div>

            <Link href={`/farm/${activeFarm.id}/advisor`} className="btn btn-outline btn-sm" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--agrios-green-300)', width: '100%', justifyContent: 'center' }}>
              Full AI Advisor Report <ChevronRight size={14} />
            </Link>
          </div>

          {/* Mandi APMC Prices Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={16} color="var(--agrios-green-600)" />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem' }}>Mandi Prices</span>
              </div>
              {market?.isDemo ? (
                <span className="badge badge-demo" style={{ fontSize: '0.65rem' }}>Benchmark</span>
              ) : (
                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>data.gov.in</span>
              )}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Modal Price ({activeFarm.crop})</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--agrios-green-700)' }}>
                  ₹{market?.averageModalPrice || 2310}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/ quintal</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--agrios-green-600)', fontSize: '0.78rem', marginTop: '2px', fontWeight: 600 }}>
                <TrendingUp size={13} /> {market?.trendPercent ? `+${market.trendPercent}%` : '+1.8%'} weekly trend
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {(market?.records || []).slice(0, 3).map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.market || r.district}</span>
                  <span style={{ fontWeight: 600 }}>₹{r.modalPrice}</span>
                </div>
              ))}
            </div>

            <div className="data-source-label"><Info size={11} /> Source: {market?.source || 'data.gov.in / Agmarknet'}</div>
          </div>

          {/* Weather Mini Forecast */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CloudRain size={16} color="var(--agrios-sky-600)" />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem' }}>7-Day Forecast</span>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Open-Meteo</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700 }}>{weather.current.temperature}</span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>°C</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              {weather.current.description} · Feels {weather.current.apparentTemperature}°C
            </div>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
              {weather.forecast.slice(0, 5).map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '6px 2px', background: 'var(--surface-muted)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {new Date(d.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: d.precipitation > 5 ? 'var(--agrios-sky-600)' : 'var(--text-secondary)', marginTop: '2px' }}>
                    {d.maxTemp}°
                  </div>
                  {d.precipitation > 0 && <div style={{ fontSize: '0.6rem', color: 'var(--agrios-sky-600)' }}>{d.precipitation}mm</div>}
                </div>
              ))}
            </div>

            <Link href={`/farm/${activeFarm.id}/weather`} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Detailed Forecast</Link>
          </div>
        </div>

        {/* Bottom Row: Government Schemes + Today's Actions + Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px' }}>
          {/* Government Schemes Matching Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="var(--agrios-amber-400)" />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem' }}>Government Schemes for You</span>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Matched</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {schemes.slice(0, 3).map((s) => (
                <div key={s.id} style={{ padding: '10px 12px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--agrios-green-600)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.name}</span>
                    <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>Eligible</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.5 }}>{s.benefitSummary}</p>
                  <div style={{ fontSize: '0.72rem', color: 'var(--agrios-green-700)', fontWeight: 600 }}>
                    💰 {s.financialBenefit}
                  </div>
                </div>
              ))}
            </div>

            <div className="data-source-label" style={{ marginTop: '12px' }}>
              <Info size={11} /> Source: Ministry of Agriculture & Farmers Welfare, GoI
            </div>
          </div>

          {/* Today's Farm Actions */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Check size={16} color="var(--agrios-green-500)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem' }}>Recommended Actions</span>
            </div>

            {[
              { priority: 'high', text: `Inspect ${activeFarm.crop} lower canopy for foliar spots` },
              { priority: 'medium', text: 'Delay scheduled irrigation pending rainfall' },
              { priority: 'medium', text: 'Clear drainage channels in low-lying zones' },
              { priority: 'low', text: 'Verify soil organic carbon test report' },
            ].map((action, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', paddingBottom: '10px', borderBottom: i < 3 ? '1px solid var(--border-muted)' : 'none' }}>
                <div className={`dot ${action.priority === 'high' ? 'dot-red' : action.priority === 'medium' ? 'dot-amber' : 'dot-green'}`} style={{ marginTop: '4px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', lineHeight: 1.5, flex: 1 }}>{action.text}</span>
              </div>
            ))}

            <Link href={`/farm/${activeFarm.id}/roadmap`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
              90-Day Roadmap →
            </Link>
          </div>

          {/* Quick Access Tiles */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>Farm Modules</div>
            {[
              { href: `/farm/${activeFarm.id}/disease`, icon: Microscope, label: 'Disease Investigator', color: 'var(--agrios-amber-400)', desc: 'Upload crop photo' },
              { href: `/farm/${activeFarm.id}/simulate`, icon: SlidersHorizontal, label: 'What-If Simulator', color: 'var(--agrios-soil-500)', desc: 'Compare farming scenarios' },
              { href: `/farm/${activeFarm.id}/soil`, icon: Layers, label: 'Soil Health Profile', color: 'var(--agrios-soil-700)', desc: 'ISRIC soil chemistry' },
              { href: '/farm', icon: Leaf, label: 'All Farm Plots', color: 'var(--agrios-green-600)', desc: 'Switch or add farms' },
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

        {/* Voice Assistant Modal */}
        <VoiceAssistant
          ctx={farmContextForVoice}
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
        />
      </div>
    </AppShell>
  );
}
