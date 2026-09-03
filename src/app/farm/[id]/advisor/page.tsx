'use client';
import AppShell from '@/components/layout/AppShell';
import { useState } from 'react';
import { Zap, Info, ChevronDown, ChevronUp, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { AIRecommendation } from '@/types';

const DEMO_REC: AIRecommendation = {
  summary: 'Your wheat field in Lucknow shows stable vegetation signal (NDVI 0.58) but elevated humidity (72%) creates moderate disease risk. Rainfall of 8-12mm is expected in 36-48 hours — delay irrigation. Inspect lower leaves tomorrow morning for early fungal symptoms.',
  riskLevel: 'medium',
  confidence: 81,
  evidence: [
    { source: 'weather', finding: 'Humidity 72% — above 70% disease risk threshold', value: 72 },
    { source: 'satellite', finding: 'NDVI 0.58 — within normal range for vegetative stage', value: 0.58 },
    { source: 'weather', finding: '8mm rainfall forecast in 36-48 hours', value: 8 },
    { source: 'soil', finding: 'pH 7.8 — slightly alkaline, may reduce micronutrient availability', value: 7.8 },
    { source: 'crop_stage', finding: 'Vegetative stage — dense canopy creates favorable disease microclimate' },
  ],
  observations: [
    'Vegetation signal is stable and within normal range for this growth stage',
    'High relative humidity creating disease-favorable conditions',
    'Significant rainfall forecast — irrigation delay recommended',
    'Soil pH slightly alkaline — monitor for iron/manganese deficiency symptoms',
  ],
  recommendations: [
    'Delay irrigation by 24-36 hours pending rainfall assessment',
    'Inspect lower canopy for early fungal disease symptoms tomorrow morning',
    'Monitor drainage after rainfall to prevent waterlogging in low-lying areas',
    'Consider foliar micronutrient application if yellowing observed',
  ],
  actionsToday: [
    { action: 'Inspect 15-20 representative plants for fungal symptoms', reason: 'High humidity + moderate temperature = disease-favorable conditions', urgency: 'today', effort: 'low' },
    { action: 'Check and clear field drainage channels', reason: '8-12mm rainfall expected — prevent waterlogging', urgency: 'today', effort: 'low' },
  ],
  actionsThisWeek: [
    { action: 'Reassess irrigation schedule after rainfall settles', reason: 'Avoid over-irrigation and nutrient leaching', urgency: 'this_week', effort: 'low' },
    { action: 'Monitor NDVI trend — check again in 7 days', reason: 'Rainfall should improve vegetation signal if crop is healthy', urgency: 'this_week', effort: 'low' },
    { action: 'Test soil for micronutrient status if yellowing appears', reason: 'Alkaline pH can lock out iron, zinc, manganese', urgency: 'this_week', effort: 'medium' },
  ],
  regenerativeActions: [
    { action: 'Plan cover crop for post-harvest soil protection', reason: 'Organic carbon (0.48 g/kg) is low — cover crops rebuild soil biology', urgency: 'this_month', effort: 'medium' },
    { action: 'Source organic compost for end-of-season application', reason: 'Long-term soil pH correction and organic matter improvement', urgency: 'this_month', effort: 'medium' },
  ],
  warnings: ['AI-generated advisory — verify recommendations in field before major decisions', 'Disease risk elevated — do not delay inspection'],
  needsFieldVerification: true,
  dataSources: ['Open-Meteo weather (no API key)', 'SoilGrids soil data', 'Sentinel-2 via Google Earth Engine', 'Gemini 2.0 Flash'],
  disclaimer: 'AI-assisted agricultural assessment. Not a replacement for qualified agronomic advice. Field verification recommended for all major decisions.',
  generatedAt: new Date().toISOString(),
};

export default function AdvisorPage() {
  const [rec, setRec] = useState<AIRecommendation>(DEMO_REC);
  const [loading, setLoading] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm: { id: 'demo-farm-001', name: 'Demo Farm', crop: 'Wheat', cropStage: 'vegetative', areaHa: 2.4, farmingPractice: 'conventional', irrigationType: 'drip', location: { state: 'Uttar Pradesh', country: 'India', lat: 26.85, lng: 80.95 } },
          weather: DEMO_REC,
          soil: { ph: 7.8, organicCarbon: 0.48, source: 'demo', isDemo: true, fetchedAt: new Date().toISOString() },
          satellite: { ndvi: 0.58, trend: 'stable', trendValue: -0.02, status: 'healthy', isDemo: true, farmId: 'demo-farm-001', date: new Date().toISOString().split('T')[0], ndviMin: 0.52, ndviMax: 0.64, source: 'GEE' },
        }),
      });
      if (res.ok) { const data = await res.json(); setRec(data); }
    } catch { /* use demo */ } finally { setLoading(false); }
  }

  const riskConfig = {
    low: { color: 'var(--agrios-green-500)', bg: 'var(--agrios-green-100)', label: 'Low Risk' },
    medium: { color: '#92400e', bg: 'var(--agrios-amber-100)', label: 'Medium Risk' },
    high: { color: 'var(--agrios-red-600)', bg: 'var(--agrios-red-100)', label: 'High Risk' },
    critical: { color: 'var(--agrios-red-600)', bg: 'var(--agrios-red-100)', label: 'Critical' },
  };
  const risk = riskConfig[rec.riskLevel];

  const urgencyLabel: Record<string, string> = { immediate: 'Immediate', today: 'Today', this_week: 'This Week', this_month: 'This Month' };

  return (
    <AppShell>
      <div style={{ padding: '28px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={22} color="var(--agrios-green-500)" />
            <h2 style={{ margin: 0 }}>AI Agricultural Advisor</h2>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleRefresh} disabled={loading}>
            {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : '↻ Refresh with Gemini AI'}
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.875rem' }}>
          Multi-agent Gemini analysis · Evidence-backed · Farm-specific context
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
          {/* Main insight */}
          <div>
            {/* Summary card */}
            <div className="card card-dark" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="var(--agrios-green-300)" />
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>AgriOS Intelligence Summary</span>
                </div>
                <div style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: risk.bg, color: risk.color, fontSize: '0.75rem', fontWeight: 700 }}>
                  {risk.label}
                </div>
              </div>

              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '20px' }}>{rec.summary}</p>

              {/* Confidence */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Confidence</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--agrios-green-300)', fontWeight: 700 }}>{rec.confidence}%</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${rec.confidence}%`, background: 'var(--agrios-green-400)', borderRadius: '4px', transition: 'width 0.8s ease' }} />
                </div>
              </div>

              {/* Observations */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Key Observations</div>
                {rec.observations.map((obs, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <div className="dot dot-green" style={{ marginTop: '5px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{obs}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence expandable */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setShowEvidence(!showEvidence)}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Evidence Trail ({rec.evidence.length} sources)</span>
                {showEvidence ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showEvidence && (
                <div style={{ marginTop: '16px', animation: 'fadeIn 0.2s ease' }}>
                  {rec.evidence.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--agrios-sky-400)', background: 'var(--agrios-sky-100)', marginBottom: '8px' }}>
                      <span className="badge badge-blue" style={{ fontSize: '0.6rem', flexShrink: 0, textTransform: 'capitalize' }}>{ev.source}</span>
                      <div>
                        <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{ev.finding}</span>
                        {ev.value !== undefined && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--agrios-sky-600)', marginLeft: '8px', fontWeight: 600 }}>{ev.value}</span>}
                      </div>
                    </div>
                  ))}
                  <div className="data-source-label" style={{ marginTop: '8px' }}>
                    <Info size={11} /> Sources: {rec.dataSources.join(' · ')}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '14px' }}>Recommendations</h4>
              {rec.recommendations.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: 22, height: 22, background: 'var(--agrios-green-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={13} color="var(--agrios-green-700)" />
                  </div>
                  <span style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action panels */}
          <div>
            {/* Warnings */}
            {rec.warnings.length > 0 && (
              <div style={{ background: 'var(--agrios-amber-100)', border: '1px solid var(--agrios-amber-400)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <AlertTriangle size={15} color="#92400e" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Warnings</span>
                </div>
                {rec.warnings.map((w, i) => <div key={i} style={{ fontSize: '0.82rem', color: '#78350f', marginBottom: '4px' }}>• {w}</div>)}
              </div>
            )}

            {/* Actions grouped by urgency */}
            {['today', 'this_week', 'this_month'].map(urgency => {
              const actions = [
                ...rec.actionsToday.filter(a => a.urgency === urgency || (urgency === 'today' && a.urgency === 'immediate')),
                ...rec.actionsThisWeek.filter(a => a.urgency === urgency),
                ...rec.regenerativeActions.filter(a => a.urgency === urgency),
              ];
              if (actions.length === 0) return null;
              return (
                <div key={urgency} className="card" style={{ marginBottom: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-heading)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`dot ${urgency === 'today' ? 'dot-red' : urgency === 'this_week' ? 'dot-amber' : 'dot-green'}`} />
                    {urgencyLabel[urgency]}
                  </div>
                  {actions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', padding: '10px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.83rem', marginBottom: '4px' }}>{action.action}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{action.reason}</div>
                        <span className={`badge ${action.effort === 'low' ? 'badge-green' : action.effort === 'medium' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '0.6rem', marginTop: '6px' }}>{action.effort} effort</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {rec.needsFieldVerification && (
              <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'var(--agrios-green-50)', border: '1px solid var(--agrios-green-200)', borderRadius: 'var(--radius-md)' }}>
                <AlertTriangle size={14} color="var(--agrios-green-700)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--agrios-green-700)', lineHeight: 1.6 }}>Field verification recommended before implementing major changes.</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <Info size={11} style={{ display: 'inline', marginRight: '4px' }} />
          {rec.disclaimer}
        </div>
      </div>
    </AppShell>
  );
}
