'use client';
// ============================================================
// AgriOS — Regional Peer Farms & Cohort Benchmarking Card
// Matches farms in the same agro-ecological zone for cross-farm learning
// ============================================================
import { useState, useEffect } from 'react';
import { Users, Award, Sprout, Compass, Sparkles } from 'lucide-react';

interface PeerFarm {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  crop: string;
  areaHa: number;
  practice: string;
  irrigation: string;
  similarityScore: number;
  benchmarkYieldQuintalsPerHa: number;
  regenerativeScore: number;
  keyPractice: string;
  isLivePeer: boolean;
}

interface RegionalPeerFarmsCardProps {
  farmId: string;
  crop: string;
  state?: string;
  practice?: string;
}

export default function RegionalPeerFarmsCard({ farmId, crop, state, practice }: RegionalPeerFarmsCardProps) {
  const [peers, setPeers] = useState<PeerFarm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadPeers() {
      setLoading(true);
      try {
        const qState = state ? `&state=${encodeURIComponent(state)}` : '';
        const qPractice = practice ? `&practice=${encodeURIComponent(practice)}` : '';
        const res = await fetch(`/api/farms/similar?farmId=${encodeURIComponent(farmId)}&crop=${encodeURIComponent(crop)}${qState}${qPractice}`);
        if (!res.ok) throw new Error('Failed to load peers');
        const data = await res.json();
        if (!cancelled && data.peers) {
          setPeers(data.peers);
        }
      } catch (err) {
        console.warn('[RegionalPeerFarmsCard] Failed to fetch peers:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPeers();
    return () => {
      cancelled = true;
    };
  }, [farmId, crop, state, practice]);

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Users size={18} color="var(--agrios-green-600)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Regional Peer Farms & Cohort Benchmarks
            </h3>
            <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
              Agro-Climatic Zone Matches
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Benchmarking {crop} parcels with similar soil profiles and weather patterns in {state || 'your region'}.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Searching regional farm clusters…
        </div>
      ) : peers.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {peers.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--surface-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>{p.name}</h4>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Compass size={11} /> {p.location} ({p.distanceKm} km away)
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: 'var(--agrios-green-100)',
                      color: 'var(--agrios-green-800)',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  >
                    {p.similarityScore}% match
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '10px 0' }}>
                  <span className="badge badge-blue" style={{ fontSize: '0.62rem' }}>{p.crop} · {p.areaHa} ha</span>
                  <span className="badge badge-amber" style={{ fontSize: '0.62rem' }}>{p.practice}</span>
                  <span className="badge" style={{ fontSize: '0.62rem', background: 'var(--surface)', border: '1px solid var(--border-default)' }}>
                    {p.irrigation}
                  </span>
                </div>

                {/* Benchmark metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', padding: '8px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Yield</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--agrios-green-700)' }}>
                      {p.benchmarkYieldQuintalsPerHa} q/ha
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Regen Score</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--agrios-green-700)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Award size={13} /> {p.regenerativeScore}/100
                    </div>
                  </div>
                </div>

                {/* Key practice */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(46, 204, 113, 0.08)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--agrios-green-500)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--agrios-green-800)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} /> Adopted Innovation:
                  </div>
                  {p.keyPractice}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Sprout size={16} style={{ marginRight: '6px' }} /> No peer farms registered in this region yet.
        </div>
      )}
    </div>
  );
}
