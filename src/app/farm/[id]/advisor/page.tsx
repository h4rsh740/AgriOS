'use client';
import AppShell from '@/components/layout/AppShell';
import { useState, use } from 'react';
import { Zap, Info, ChevronDown, ChevronUp, AlertTriangle, Check, Loader2, Database, Wifi } from 'lucide-react';
import { AIRecommendation } from '@/types';
import { useFarmContext } from '@/hooks/useFarmContext';
import { DEMO_RECOMMENDATION } from '@/lib/demo/demoData';

export default function AdvisorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: farmId } = use(params);
  const { ctx, loading: ctxLoading } = useFarmContext(farmId);
  const [rec, setRec] = useState<AIRecommendation>(DEMO_RECOMMENDATION);
  const [loading, setLoading] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [isLive, setIsLive] = useState(false);

  async function handleRefresh() {
    if (!ctx) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx),
      });
      if (res.ok) {
        const data = await res.json();
        setRec(data);
        setIsLive(true);
      }
    } catch { /* keep demo */ } finally { setLoading(false); }
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
            {isLive
              ? <span className="badge" style={{ background: 'var(--agrios-green-100)', color: 'var(--agrios-green-700)', fontSize: '0.7rem' }}><Wifi size={10} /> Live</span>
              : <span className="badge badge-demo"><Database size={10} /> Demo</span>
            }
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleRefresh}
            disabled={loading || ctxLoading || !ctx}
            title={!ctx ? 'Loading farm context…' : 'Analyze with Gemini AI'}
          >
            {ctxLoading
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading context…</>
              : loading
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing with Gemini…</>
              : '⚡ Analyze with Gemini AI'}
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.875rem' }}>
          Multi-agent Gemini analysis · Evidence-backed · Real weather + soil + satellite context
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
