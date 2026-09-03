// ============================================================
// AgriOS — useFarmContext hook
// Builds a complete FarmContext from the route [id] param by
// calling the weather, soil, and satellite APIs in parallel.
// Falls back to demo data when any service is unavailable.
// Used by Advisor, Disease, Simulator, Roadmap, etc.
// ============================================================
'use client';
import { useState, useEffect, useCallback } from 'react';
import { FarmContext } from '@/types';
import { DEMO_FARM, DEMO_WEATHER, DEMO_SOIL, DEMO_SATELLITE } from '@/lib/demo/demoData';

export type FarmContextState = {
  ctx: FarmContext | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useFarmContext(farmId: string): FarmContextState {
  const [ctx, setCtx] = useState<FarmContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use demo farm for now; in production, fetch from Firestore by farmId
      const farm = farmId === 'demo-farm-001' ? DEMO_FARM : {
        ...DEMO_FARM,
        id: farmId,
        name: `Farm ${farmId.slice(0, 6)}`,
      };

      const lat = farm.location.lat;
      const lng = farm.location.lng;

      // Fetch all data sources in parallel — each falls back independently
      const [weatherRes, soilRes, satelliteRes] = await Promise.allSettled([
        fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng }),
        }).then(r => r.ok ? r.json() : null),

        fetch('/api/soil', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng }),
        }).then(r => r.ok ? r.json() : null),

        fetch(`/api/satellite?farmId=${farmId}&lat=${lat}&lng=${lng}`)
          .then(r => r.ok ? r.json() : null),
      ]);

      const weather = weatherRes.status === 'fulfilled' && weatherRes.value ? weatherRes.value : DEMO_WEATHER;
      const soil = soilRes.status === 'fulfilled' && soilRes.value ? soilRes.value : DEMO_SOIL;
      const satellite = satelliteRes.status === 'fulfilled' && satelliteRes.value ? satelliteRes.value : DEMO_SATELLITE;

      const isDemo = weather === DEMO_WEATHER || soil === DEMO_SOIL || satellite === DEMO_SATELLITE;

      setCtx({ farm, weather, soil, satellite, isDemo });
    } catch (err) {
      console.error('[useFarmContext]', err);
      setError('Failed to load farm data — showing demo context.');
      setCtx({
        farm: DEMO_FARM,
        weather: DEMO_WEATHER,
        soil: DEMO_SOIL,
        satellite: DEMO_SATELLITE,
        isDemo: true,
      });
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => { load(); }, [load]);

  return { ctx, loading, error, refresh: load };
}
