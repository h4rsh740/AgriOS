'use client';
import AppShell from '@/components/layout/AppShell';
import { useState, use } from 'react';
import { SlidersHorizontal, Info, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SimulationComparison } from '@/types';
import Link from 'next/link';
import { useFarmContext } from '@/hooks/useFarmContext';

const DEMO_SIMULATION: SimulationComparison = {
  farmId: 'demo-farm-001',
  scenarios: [
    {
      scenario: 'current', label: 'Current Practice', parameters: { irrigationIntensity: 80, fertilizerIntensity: 75, tillageIntensity: 70, coverCrop: false, cropRotation: false, organicMatter: false, integratedPestManagement: false },
      waterUse: 100, inputUse: 100, estimatedCost: 100, soilHealthDirection: 'stable', yieldDirection: 'stable',
      resilienceScore: 45, riskLevel: 'medium', explanation: 'Current practices maintain yield but may deplete soil health over time. High water and input use creates cost pressure.',
      assumptions: ['Baseline water use set to irrigation intensity of 80%', 'Fertilizer intensity at 75% of maximum', 'No cover crop or rotation'],
    },
    {
      scenario: 'water_saving', label: 'Water-Saving', parameters: { irrigationIntensity: 55, fertilizerIntensity: 70, tillageIntensity: 65, coverCrop: false, cropRotation: false, organicMatter: false, integratedPestManagement: true },
      waterUse: 85, inputUse: 92, estimatedCost: 87, soilHealthDirection: 'stable', yieldDirection: 'stable',
      resilienceScore: 56, riskLevel: 'medium', explanation: 'Reducing irrigation intensity and adopting IPM reduces water use by ~15-20%. Minimal yield impact expected in most conditions.',
      assumptions: ['Drip/micro-irrigation reduces water by ~15-25% vs flood', 'IPM reduces pesticide use by ~20%', 'Yield impact: ±2% depending on conditions'],
    },
    {
      scenario: 'regenerative', label: 'Regenerative', parameters: { irrigationIntensity: 55, fertilizerIntensity: 50, tillageIntensity: 30, coverCrop: true, cropRotation: true, organicMatter: true, integratedPestManagement: true },
      waterUse: 90, inputUse: 78, estimatedCost: 73, soilHealthDirection: 'improving', yieldDirection: 'positive',
      resilienceScore: 78, riskLevel: 'low', explanation: 'Cover crops, crop rotation and reduced tillage rebuild soil organic matter over 2-3 years.',
      assumptions: ['Cover crop adds 0.2-0.5 g/kg organic carbon per year', 'Reduced tillage cuts fuel/labor costs 10-15%', 'Benefits compound over 2-5 year timeframe'],
    },
  ],
  recommendation: 'The Regenerative scenario shows the strongest long-term potential for soil health and resilience improvement, with moderate upfront investment.',
  disclaimer: 'Simulation estimates are based on transparent heuristic assumptions and should not be interpreted as calibrated agronomic predictions.',
  generatedAt: new Date().toISOString(),
};

const SCENARIO_COLORS = { current: '#9CA3AF', water_saving: '#38BDF8', regenerative: '#2D9B5A' };
const SCENARIO_BORDER_COLORS = { current: '#D1D5DB', water_saving: '#0EA5E9', regenerative: '#16a34a' };

export default function SimulatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: farmId } = use(params);
  const { ctx } = useFarmContext(farmId);
  const [simulation] = useState<SimulationComparison>(DEMO_SIMULATION);
  const [selected, setSelected] = useState<string | null>(null);

  const farmDesc = ctx
    ? `${ctx.farm.crop} · ${ctx.farm.cropStage} · ${ctx.farm.areaHa}ha`
    : 'Wheat · Vegetative · 2.4ha';

  const radarData = ['Water Efficiency', 'Cost', 'Resilience', 'Soil Health', 'Yield', 'Risk'].map(metric => {
    const entry: Record<string, unknown> = { metric };
    simulation.scenarios.forEach(s => {
      const v = metric === 'Water Efficiency' ? 100 - s.waterUse :
               metric === 'Cost' ? 100 - s.estimatedCost :
               metric === 'Resilience' ? s.resilienceScore :
               metric === 'Soil Health' ? (s.soilHealthDirection === 'improving' ? 80 : s.soilHealthDirection === 'stable' ? 60 : 40) :
               metric === 'Yield' ? (s.yieldDirection === 'positive' ? 80 : s.yieldDirection === 'stable' ? 60 : 40) :
               metric === 'Risk' ? (s.riskLevel === 'low' ? 80 : s.riskLevel === 'medium' ? 50 : 20) : 0;
      entry[s.scenario] = v;
    });
    return entry;
  });

  return (
    <AppShell>
      <div style={{ padding: '28px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <SlidersHorizontal size={22} color="var(--agrios-soil-700)" />
          <h2 style={{ margin: 0 }}>What-If Farm Simulator</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.875rem' }}>
          Compare farming strategies before committing. Farm context: {farmDesc}
        </p>

        {/* Disclaimer */}
        <div style={{ background: 'var(--agrios-amber-100)', border: '1px solid var(--agrios-amber-400)', borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: '28px', fontSize: '0.8rem', color: '#78350f', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Info size={14} />
          Simulation estimates based on transparent heuristic assumptions — not calibrated agronomic predictions.
        </div>

        {/* Scenario cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {simulation.scenarios.map(scenario => {
            const isSelected = selected === scenario.scenario;
            const isRegen = scenario.scenario === 'regenerative';
            return (
              <div
                key={scenario.scenario}
                className="card"
                onClick={() => setSelected(isSelected ? null : scenario.scenario)}
                style={{
                  cursor: 'pointer',
                  border: `2px solid ${isSelected ? SCENARIO_BORDER_COLORS[scenario.scenario as keyof typeof SCENARIO_BORDER_COLORS] : 'var(--border-default)'}`,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {isRegen && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--agrios-green-500)', color: 'white', fontSize: '0.68rem', fontWeight: 700, padding: '3px 12px', borderRadius: 'var(--radius-full)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    RECOMMENDED
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: SCENARIO_COLORS[scenario.scenario as keyof typeof SCENARIO_COLORS] }} />
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem' }}>{scenario.label}</span>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: 'Water Use', current: 100, value: scenario.waterUse, unit: '%' },
                    { label: 'Input Cost', current: 100, value: scenario.estimatedCost, unit: '%' },
                    { label: 'Resilience', current: 45, value: scenario.resilienceScore, unit: '/100' },
                  ].map((m, i) => {
                    const delta = m.value - m.current;
                    const isGood = m.label === 'Resilience' ? delta > 0 : delta < 0;
                    const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.9rem' }}>{m.value}{m.unit}</span>
                          {scenario.scenario !== 'current' && delta !== 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: isGood ? 'var(--agrios-green-600)' : 'var(--agrios-red-400)', fontSize: '0.72rem', fontWeight: 700 }}>
                              <TrendIcon size={12} />
                              {Math.abs(delta)}{m.unit}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Soil Direction</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: scenario.soilHealthDirection === 'improving' ? 'var(--agrios-green-600)' : 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {scenario.soilHealthDirection === 'improving' ? '↑ Improving' : scenario.soilHealthDirection === 'declining' ? '↓ Declining' : '→ Stable'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Risk Level</span>
                    <span className={`badge ${scenario.riskLevel === 'low' ? 'badge-green' : scenario.riskLevel === 'medium' ? 'badge-amber' : 'badge-red'}`} style={{ textTransform: 'capitalize' }}>
                      {scenario.riskLevel}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '12px' }}>{scenario.explanation}</p>

                {isSelected && (
                  <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '12px', marginTop: '8px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Assumptions</div>
                    {scenario.assumptions.map((a, i) => (
                      <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>• {a}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Radar Chart */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '20px' }}>Scenario Comparison Radar</h4>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border-default)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Radar name="Current" dataKey="current" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Water-Saving" dataKey="water_saving" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Regenerative" dataKey="regenerative" stroke="#2D9B5A" fill="#2D9B5A" fillOpacity={0.2} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Recommendation */}
        <div className="card card-tinted" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: 40, height: 40, background: 'var(--agrios-green-100)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={20} color="var(--agrios-green-600)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>Simulation Insight</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{simulation.recommendation}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/farm/demo-farm-001/roadmap" className="btn btn-primary">
            Generate 90-Day Regenerative Roadmap <ArrowRight size={16} />
          </Link>
          <Link href="/farm/demo-farm-001/regenerative" className="btn btn-outline">
            View Regenerative Score
          </Link>
        </div>

        <div className="data-source-label" style={{ justifyContent: 'center', marginTop: '16px' }}>
          <Info size={12} />
          {simulation.disclaimer}
        </div>
      </div>
    </AppShell>
  );
}
