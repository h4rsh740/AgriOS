'use client';
// ============================================================
// AgriOS — Farm Management & Switcher Hub
// View and select all registered farms
// ============================================================
import AppShell from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Leaf, Plus, MapPin, ChevronRight, Database } from 'lucide-react';
import { Farm } from '@/types';
import { DEMO_FARM } from '@/lib/demo/demoData';
import { useAuth } from '@/hooks/useAuth';

export default function FarmListPage() {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([DEMO_FARM]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarms() {
      setLoading(true);
      const list: Farm[] = [];

      // 1. Try Firestore if user is authenticated
      if (user?.uid) {
        try {
          const { getUserFarms } = await import('@/lib/firebase/firestore');
          const remoteFarms = await getUserFarms(user.uid);
          if (remoteFarms && remoteFarms.length > 0) {
            list.push(...remoteFarms);
          }
        } catch {
          // Firestore unavailable
        }
      }

      // 2. Load locally cached farms from localStorage
      if (typeof window !== 'undefined') {
        try {
          const local = JSON.parse(localStorage.getItem('agrios_local_farms') || '[]');
          for (const lf of local) {
            if (!list.some(f => f.id === lf.id)) {
              list.push(lf);
            }
          }
        } catch {
          // parse error ignored
        }
      }

      // 3. Always ensure DEMO_FARM is available as benchmark
      if (!list.some(f => f.id === DEMO_FARM.id)) {
        list.push(DEMO_FARM);
      }

      setFarms(list);
      setLoading(false);
    }

    void loadFarms();
  }, [user]);

  return (
    <AppShell>
      <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Leaf size={24} color="var(--agrios-green-600)" />
              <h2 style={{ margin: 0 }}>Farm Management</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Manage your agricultural plots, field boundaries, and digital twins.
            </p>
          </div>

          <Link href="/onboarding" className="btn btn-primary btn-sm">
            <Plus size={16} /> Add New Farm
          </Link>
        </div>

        {/* Farm Cards Grid */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading digital twin plots...
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {farms.map((farm) => {
            const isBenchmark = farm.id === DEMO_FARM.id;
            const locationStr = [farm.location.district, farm.location.state, farm.location.country].filter(Boolean).join(', ')
              || `${farm.location.lat.toFixed(2)}, ${farm.location.lng.toFixed(2)}`;

            return (
              <div key={farm.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: `4px solid ${isBenchmark ? 'var(--agrios-sky-400)' : 'var(--agrios-green-600)'}` }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>{farm.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        <MapPin size={12} /> {locationStr}
                      </div>
                    </div>
                    {isBenchmark ? (
                      <span className="badge badge-demo"><Database size={10} /> Benchmark</span>
                    ) : (
                      <span className="badge badge-green">Active Twin</span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '16px 0', padding: '12px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Crop</div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{farm.crop}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Stage</div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', textTransform: 'capitalize' }}>{farm.cropStage.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Area</div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{farm.areaHa} ha</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Irrigation</div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', textTransform: 'capitalize' }}>{farm.irrigationType}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <Link href={`/farm/${farm.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    Open Digital Twin <ChevronRight size={14} />
                  </Link>
                  <Link href={`/farm/${farm.id}/advisor`} className="btn btn-outline btn-sm" title="AI Advisor">
                    AI
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </AppShell>
  );
}
