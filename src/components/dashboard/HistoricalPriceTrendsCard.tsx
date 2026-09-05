'use client';
// ============================================================
// AgriOS — BigQuery Historical Mandi Analytics Widget
// Multi-year modal price trends and APMC arrival volumes
// ============================================================
import { useState, useEffect } from 'react';
import { Database, TrendingUp, BarChart2, CheckCircle2, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

interface TrendItem {
  year: number;
  month: number;
  crop: string;
  avgModalPrice: number;
  totalArrivalVolumeQuintals: number;
}

interface Provenance {
  dataset: string;
  project: string;
  tablesQueried: string[];
  executionTimeMs: number;
  isDemo: boolean;
}

interface HistoricalPriceTrendsCardProps {
  crop: string;
  state?: string;
}

export default function HistoricalPriceTrendsCard({ crop, state }: HistoricalPriceTrendsCardProps) {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [provenance, setProvenance] = useState<Provenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'price' | 'volume'>('price');

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const queryState = state ? `&state=${encodeURIComponent(state)}` : '';
        const res = await fetch(`/api/analytics/historical?crop=${encodeURIComponent(crop)}${queryState}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (!cancelled && data.trends) {
          // Sort chronologically ascending for chart rendering
          const sorted = [...data.trends].sort((a: TrendItem, b: TrendItem) => {
            return a.year === b.year ? a.month - b.month : a.year - b.year;
          });
          setTrends(sorted);
          setProvenance(data.provenance || null);
        }
      } catch (err) {
        console.warn('[HistoricalPriceTrends] Failed to load BigQuery trends:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [crop, state]);

  // Format data for Recharts
  const chartData = trends.map((t) => ({
    period: `${t.month}/${t.year.toString().slice(-2)}`,
    price: t.avgModalPrice,
    volume: Math.round(t.totalArrivalVolumeQuintals / 1000), // in '000 Quintals
    fullLabel: `${t.year} - Month ${t.month}`,
  }));

  return (
    <div className="card" style={{ marginTop: '24px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Database size={17} color="var(--agrios-blue-500)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              BigQuery Historical Mandi Analytics
            </h3>
            {provenance && (
              <span
                className={`badge ${provenance.isDemo ? 'badge-amber' : 'badge-green'}`}
                style={{ fontSize: '0.62rem' }}
              >
                {provenance.isDemo ? 'Historical Archive' : 'Live BigQuery'}
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Multi-year seasonal price trends and APMC arrival volumes for {crop} in {state || 'India'}.
          </p>
        </div>

        {/* Metric Selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn btn-sm ${metric === 'price' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMetric('price')}
          >
            <TrendingUp size={13} /> Modal Price (₹/q)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${metric === 'volume' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMetric('volume')}
          >
            <BarChart2 size={13} /> Arrivals (k Quintals)
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Querying Google Cloud BigQuery dataset…
        </div>
      ) : chartData.length > 0 ? (
        <div>
          <div style={{ height: '220px', width: '100%', marginBottom: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {metric === 'price' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                  <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis
                    domain={['dataMin - 100', 'dataMax + 100']}
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                    }}
                    formatter={(val) => [`₹${val}/quintal`, 'Avg Modal Price']}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--agrios-green-600)"
                    strokeWidth={2.5}
                    dot={{ fill: 'var(--agrios-green-500)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                  <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v}k`} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                    }}
                    formatter={(val) => [`${val}k quintals`, 'Total Volume']}
                  />
                  <Bar dataKey="volume" fill="var(--agrios-sky-500)" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Provenance & SQL Dataset Footer */}
          {provenance && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '8px 12px',
                background: 'var(--surface-muted)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={12} color="var(--agrios-green-600)" />
                <span>Dataset: <code>{provenance.dataset}</code></span>
                <span>· Tables: <code>{provenance.tablesQueried.join(', ')}</code></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} />
                <span>Query latency: {provenance.executionTimeMs}ms</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No historical price records found for this commodity in BigQuery.
        </div>
      )}
    </div>
  );
}
