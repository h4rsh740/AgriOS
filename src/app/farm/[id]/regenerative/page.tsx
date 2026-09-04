'use client';
import AppShell from '@/components/layout/AppShell';
import { DEMO_REGENERATIVE_SCORE } from '@/lib/demo/demoData';
import { Repeat2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, use } from 'react';
import Link from 'next/link';
import { ScoreCategory } from '@/types';
import { useFarmContext } from '@/hooks/useFarmContext';

function CategoryBar({ cat, weight }: { cat: ScoreCategory; weight: number }) {
  const [open, setOpen] = useState(false);
  const statusColor = cat.status === 'excellent' ? 'var(--agrios-green-500)' :
    cat.status === 'good' ? 'var(--agrios-green-400)' :
    cat.status === 'fair' ? 'var(--agrios-amber-400)' : 'var(--agrios-red-400)';

  return (
    <div style={{ borderBottom: '1px solid var(--border-muted)', paddingBottom: '16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{weight}% weight</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: statusColor }}>{cat.score}</span>
              <span className={`badge ${cat.status === 'excellent' || cat.status === 'good' ? 'badge-green' : cat.status === 'fair' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>{cat.status}</span>
            </div>
          </div>
          <div className="confidence-bar" style={{ height: 8 }}>
            <div className="confidence-bar-fill" style={{ width: `${cat.score}%`, background: statusColor, transition: 'width 0.8s ease' }} />
          </div>
        </div>
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {open && (
        <div style={{ paddingLeft: '4px', animation: 'fadeIn 0.2s ease' }}>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '12px' }}>{cat.explanation}</p>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Improvement Opportunities</div>
          {cat.improvements.map((imp, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <div className="dot dot-green" style={{ marginTop: '5px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{imp}</span>
            </div>
          ))}
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Confidence: {cat.confidence}%
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegenerativePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: farmId } = use(params);
  const { ctx } = useFarmContext(farmId);
  const score = ctx?.regenerativeScore || DEMO_REGENERATIVE_SCORE;
  const weights = { soilHealth: 20, waterEfficiency: 18, biodiversity: 12, inputEfficiency: 15, cropResilience: 15, carbonOM: 10, climateResilience: 10 };

  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - score.total / 100);

  return (
    <AppShell>
      <div style={{ padding: '28px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Repeat2 size={22} color="var(--agrios-green-500)" />
          <h2 style={{ margin: 0 }}>Regenerative Intelligence</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.875rem' }}>
          Rule-based score across 7 dimensions of regenerative agriculture. Clearly labeled as estimate.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Score hero */}
          <div>
            <div className="card card-dark" style={{ textAlign: 'center', padding: '36px 24px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 20px' }}>
                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                  <circle cx="70" cy="70" r="54" fill="none" stroke="var(--agrios-green-400)" strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s ease' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '2.2rem', color: 'white', lineHeight: 1 }}>{score.total}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--agrios-green-200)' }}>/100</span>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'white', fontSize: '1rem', marginBottom: '6px' }}>AgriOS Regenerative Index</div>
              <span className="badge badge-green" style={{ margin: '0 auto' }}>Good Standing</span>

              {/* Mini bars */}
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                {(Object.entries(score.categories) as [string, ScoreCategory][]).map(([key, cat]) => (
                  <div key={key} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{cat.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--agrios-green-300)', fontWeight: 600 }}>{cat.score}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${cat.score}%`, background: cat.score >= 70 ? 'var(--agrios-green-400)' : cat.score >= 50 ? 'var(--agrios-amber-400)' : 'var(--agrios-red-400)', borderRadius: '2px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-sm" style={{ background: 'var(--agrios-amber-100)', border: '1px solid var(--agrios-amber-400)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Important Note</div>
              <p style={{ fontSize: '0.78rem', color: '#78350f', lineHeight: 1.7, margin: 0 }}>{score.disclaimer}</p>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card">
            <h4 style={{ marginBottom: '24px' }}>Score Breakdown by Category</h4>
            {(Object.entries(score.categories) as [string, ScoreCategory][]).map(([key, cat]) => (
              <CategoryBar key={key} cat={cat} weight={weights[key as keyof typeof weights]} />
            ))}
            <div className="data-source-label"><Info size={12} /> Scores are rule-based estimates from farm profile, soil, weather, and satellite data · Demo Data</div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Link href="/farm/demo-farm-001/roadmap" className="btn btn-primary">
            Generate 90-Day Action Plan →
          </Link>
          <Link href="/farm/demo-farm-001/simulate" className="btn btn-outline">
            Compare Scenarios
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
