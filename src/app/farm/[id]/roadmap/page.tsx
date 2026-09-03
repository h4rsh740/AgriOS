'use client';
import AppShell from '@/components/layout/AppShell';
import { useState, use } from 'react';
import { MapPin, Info, Check, AlertTriangle, Loader2, Database, Wifi } from 'lucide-react';
import { RegenerativeRoadmap, RoadmapAction } from '@/types';
import { useFarmContext } from '@/hooks/useFarmContext';

const PHASE_COLORS = ['var(--agrios-sky-600)', 'var(--agrios-green-500)', 'var(--agrios-soil-500)'];
const CATEGORY_COLORS: Record<string, string> = {
  soil: 'var(--agrios-soil-500)', water: 'var(--agrios-sky-600)', crop: 'var(--agrios-green-500)',
  pest: 'var(--agrios-red-400)', biodiversity: 'var(--agrios-green-400)', input: 'var(--agrios-amber-400)',
  monitoring: 'var(--text-muted)',
};

function ActionCard({ action, idx }: { action: RoadmapAction; idx: number }) {
  const [checked, setChecked] = useState(false);
  const color = CATEGORY_COLORS[action.category] || 'var(--text-muted)';

  return (
    <div style={{
      display: 'flex', gap: '14px', padding: '16px',
      background: checked ? 'var(--agrios-green-50)' : 'var(--surface-card)',
      border: `1px solid ${checked ? 'var(--agrios-green-200)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-md)', marginBottom: '12px',
      transition: 'all 0.2s', opacity: checked ? 0.7 : 1,
      borderLeft: `4px solid ${color}`,
    }}>
      <button
        onClick={() => setChecked(!checked)}
        style={{
          width: 24, height: 24, borderRadius: '6px', border: `2px solid ${checked ? 'var(--agrios-green-500)' : 'var(--border-default)'}`,
          background: checked ? 'var(--agrios-green-500)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, marginTop: '2px', transition: 'all 0.2s',
        }}
      >
        {checked && <Check size={14} color="white" />}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
            {idx + 1}. {action.action}
          </span>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '10px' }}>
            <span className={`badge ${action.effort === 'low' ? 'badge-green' : action.effort === 'medium' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '0.62rem' }}>
              {action.effort} effort
            </span>
            <span className="badge badge-blue" style={{ fontSize: '0.62rem', textTransform: 'capitalize' }}>{action.category}</span>
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.6 }}>
          <strong>Why:</strong> {action.why}
        </p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="dot dot-green" />
          <span style={{ fontSize: '0.78rem', color: 'var(--agrios-green-700)' }}><strong>Expected:</strong> {action.expectedBenefit}</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          Confidence: {action.confidence}% · Risk: {action.risk}
        </div>
      </div>
    </div>
  );
}

const DEMO_ROADMAP: RegenerativeRoadmap = {
  farmId: 'demo-farm-001',
  phases: [
    {
      phase: 1, label: 'Immediate Actions', startDay: 1, endDay: 30,
      focus: 'Stabilize crop health and optimize current season inputs',
      actions: [
        { action: 'Conduct comprehensive field inspection for disease and pest pressure', why: 'High humidity creates disease risk — early detection prevents major losses', expectedBenefit: 'Prevent 15-25% yield loss from undetected disease', effort: 'low', risk: 'low', confidence: 82, category: 'monitoring' },
        { action: 'Optimize irrigation scheduling using weather forecast', why: 'Rainfall expected in 36-48 hours — avoid over-irrigation', expectedBenefit: 'Reduce water use 10-15%, prevent waterlogging', effort: 'low', risk: 'low', confidence: 88, category: 'water' },
        { action: 'Apply foliar micronutrient supplement if leaf yellowing observed', why: 'Alkaline pH (7.8) reduces iron and manganese availability', expectedBenefit: 'Restore leaf greenness, improve photosynthesis efficiency', effort: 'medium', risk: 'low', confidence: 70, category: 'soil' },
        { action: 'Map field zones with drainage issues', why: 'Pre-harvest planning prevents waterlogging in next season', expectedBenefit: 'Reduce crop loss from waterlogging 5-10% next season', effort: 'low', risk: 'low', confidence: 75, category: 'monitoring' },
      ],
    },
    {
      phase: 2, label: 'Short-term Investments', startDay: 31, endDay: 60,
      focus: 'Begin soil health improvement and prepare for crop rotation',
      actions: [
        { action: 'Plan cover crop selection for post-harvest planting', why: 'Low organic carbon (0.48 g/kg) can be improved by cover crops', expectedBenefit: 'Add 0.2-0.4 g/kg organic carbon per year', effort: 'medium', risk: 'low', confidence: 80, category: 'soil' },
        { action: 'Order compost or vermicompost for post-harvest application', why: 'Building organic matter requires advance planning and sourcing', expectedBenefit: 'Improve water retention, soil biology, and future yields', effort: 'medium', risk: 'low', confidence: 78, category: 'soil' },
        { action: 'Research and select next season legume rotation crop', why: 'Legume in rotation fixes nitrogen and breaks pest cycles', expectedBenefit: 'Reduce nitrogen fertilizer cost 20-30% in following year', effort: 'low', risk: 'low', confidence: 75, category: 'crop' },
        { action: 'Install or repair drip irrigation in low-efficiency zones', why: 'Water efficiency improvements have multi-season ROI', expectedBenefit: 'Reduce water use 25-40% vs flood irrigation', effort: 'high', risk: 'low', confidence: 85, category: 'water' },
      ],
    },
    {
      phase: 3, label: 'Sustainable Transitions', startDay: 61, endDay: 90,
      focus: 'Post-harvest transitions for long-term regenerative system',
      actions: [
        { action: 'Plant selected cover crop after wheat harvest', why: 'Prevents soil erosion, adds organic matter, supports beneficial insects', expectedBenefit: 'Measurable soil health improvement within 1 growing season', effort: 'medium', risk: 'low', confidence: 80, category: 'biodiversity' },
        { action: 'Reduce tillage depth for next season preparation', why: 'Reduced tillage preserves soil structure and biology', expectedBenefit: 'Reduce fuel cost 10-15%, improve soil structure', effort: 'medium', risk: 'medium', confidence: 72, category: 'soil' },
        { action: 'Apply compost at 2-3 tons/ha before next crop planting', why: 'Organic matter amendment builds long-term soil fertility', expectedBenefit: 'Improve soil carbon, water retention, and biological activity', effort: 'high', risk: 'low', confidence: 82, category: 'soil' },
        { action: 'Establish field-edge biodiversity strips (native plants)', why: 'Beneficial insects reduce pest pressure naturally', expectedBenefit: 'Reduce pesticide costs 10-20% over 2-3 seasons', effort: 'low', risk: 'low', confidence: 68, category: 'biodiversity' },
      ],
    },
  ],
  overallGoal: 'Transform from conventional wheat farming toward a regenerative system with improved soil health, reduced input dependency, and greater climate resilience over the next 90 days.',
  expectedOutcomes: [
    'Soil organic carbon trajectory toward +0.3 g/kg within 12 months',
    'Water use reduction of 15-25%',
    'Reduction in external fertilizer dependency',
    'Improved biodiversity and beneficial insect populations',
  ],
  generatedAt: new Date().toISOString(),
  disclaimer: 'AI-generated regenerative roadmap. Review with a qualified local agronomist before making major investments. Outcomes vary significantly by location, soil type, and implementation quality.',
};

export default function RoadmapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: farmId } = use(params);
  const { ctx, loading: ctxLoading } = useFarmContext(farmId);
  const [roadmap, setRoadmap] = useState<RegenerativeRoadmap>(DEMO_ROADMAP);
  const [generating, setGenerating] = useState(false);
  const [isLive, setIsLive] = useState(false);

  async function handleGenerate() {
    if (!ctx) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/regenerative/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx),
      });
      if (res.ok) { const data = await res.json(); setRoadmap(data); setIsLive(true); }
    } catch { /* use demo */ } finally { setGenerating(false); }
  }

  const totalActions = roadmap.phases.reduce((s, p) => s + p.actions.length, 0);

  return (
    <AppShell>
      <div style={{ padding: '28px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={22} color="var(--agrios-green-500)" />
            <h2 style={{ margin: 0 }}>90-Day Regenerative Roadmap</h2>
            {isLive
              ? <span className="badge" style={{ background: 'var(--agrios-green-100)', color: 'var(--agrios-green-700)', fontSize: '0.7rem' }}><Wifi size={10} /> Live</span>
              : <span className="badge badge-demo"><Database size={10} /> Demo</span>
            }
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleGenerate}
            disabled={generating || ctxLoading || !ctx}
          >
            {generating ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : '↻ Re-generate with Gemini AI'}
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.875rem' }}>
          AI-generated action plan · Demo Farm · Wheat · Lucknow, India
        </p>

        {/* Goal + stats */}
        <div className="card card-tinted" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--agrios-green-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>90-Day Goal</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-primary)', margin: 0 }}>{roadmap.overallGoal}</p>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {[{ v: '3', l: 'Phases' }, { v: String(totalActions), l: 'Actions' }, { v: '90', l: 'Days' }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.6rem', color: 'var(--agrios-green-700)' }}>{s.v}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {roadmap.phases.map((phase, pi) => (
            <div key={pi} style={{ marginBottom: '32px', position: 'relative' }}>
              {/* Phase header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: PHASE_COLORS[pi], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 0 4px ${PHASE_COLORS[pi]}25` }}>
                  <span style={{ color: 'white', fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>{phase.phase}</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>{phase.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Day {phase.startDay}–{phase.endDay} · {phase.focus}</div>
                </div>
                <span style={{ marginLeft: 'auto', background: `${PHASE_COLORS[pi]}15`, border: `1px solid ${PHASE_COLORS[pi]}40`, color: PHASE_COLORS[pi], fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                  {phase.actions.length} actions
                </span>
              </div>

              {/* Actions */}
              <div style={{ marginLeft: '58px' }}>
                {phase.actions.map((action, ai) => (
                  <ActionCard key={ai} action={action} idx={ai} />
                ))}
              </div>

              {/* Connector line */}
              {pi < roadmap.phases.length - 1 && (
                <div style={{ position: 'absolute', left: '21px', top: '56px', bottom: '-20px', width: '2px', background: 'var(--border-muted)', zIndex: 0 }} />
              )}
            </div>
          ))}
        </div>

        {/* Expected Outcomes */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h4 style={{ marginBottom: '16px' }}>Expected Outcomes</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {roadmap.expectedOutcomes.map((outcome, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px', background: 'var(--agrios-green-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--agrios-green-100)' }}>
                <div className="dot dot-green" style={{ marginTop: '4px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{outcome}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px', background: 'var(--agrios-amber-100)', borderRadius: 'var(--radius-md)', border: '1px solid var(--agrios-amber-400)' }}>
          <AlertTriangle size={15} color="#92400e" />
          <p style={{ fontSize: '0.78rem', color: '#78350f', margin: 0 }}>{roadmap.disclaimer}</p>
        </div>

        <div className="data-source-label" style={{ marginTop: '12px' }}><Info size={12} /> Generated by Gemini AI · Demo Data · {new Date(roadmap.generatedAt).toLocaleString()}</div>
      </div>
    </AppShell>
  );
}
