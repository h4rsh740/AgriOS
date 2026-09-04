// ============================================================
// AgriOS — useFarmContext hook
// Builds a complete FarmContext from the route [id] param by
// calling the weather, soil, and satellite APIs in parallel.
// Falls back to demo data when any service is unavailable.
// Used by Advisor, Disease, Simulator, Roadmap, etc.
// ============================================================
'use client';
import { useState, useEffect, useCallback } from 'react';
import { FarmContext, Farm } from '@/types';
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
      let farm: Farm = DEMO_FARM;
      let fromLiveFarm = false;

      // Try resolving farm from Firestore or local storage if not demo-farm-001
      if (farmId && farmId !== 'demo-farm-001') {
        try {
          const { getFarm } = await import('@/lib/firebase/firestore');
          const firestoreFarm = await getFarm(farmId);
          if (firestoreFarm) {
            farm = firestoreFarm;
            fromLiveFarm = true;
          }
        } catch {
          // If Firestore is unconfigured or fails, check localStorage for locally created farm
          if (typeof window !== 'undefined') {
            const savedFarms = localStorage.getItem('agrios_local_farms');
            if (savedFarms) {
              try {
                const parsed = JSON.parse(savedFarms) as Farm[];
                const found = parsed.find(f => f.id === farmId);
                if (found) {
                  farm = found;
                  fromLiveFarm = true;
                }
              } catch {
                // ignore localStorage parse error
              }
            }
          }
        }
      }

      if (!fromLiveFarm && farmId !== 'demo-farm-001') {
        farm = {
          ...DEMO_FARM,
          id: farmId,
          name: `Farm ${farmId.slice(0, 6)}`,
        };
      }

      const lat = farm.location.lat;
      const lng = farm.location.lng;

      // Fetch all data sources in parallel — each falls back independently
      const [weatherRes, soilRes, satelliteRes] = await Promise.allSettled([
        fetch(`/api/weather?lat=${lat}&lng=${lng}`).then(r => r.ok ? r.json() : null),
        fetch(`/api/soil?lat=${lat}&lng=${lng}`).then(r => r.ok ? r.json() : null),
        fetch(`/api/satellite?farmId=${farmId}&lat=${lat}&lng=${lng}`).then(r => r.ok ? r.json() : null),
      ]);

      const weather = weatherRes.status === 'fulfilled' && weatherRes.value ? weatherRes.value : { ...DEMO_WEATHER, isDemo: true };
      const soil = soilRes.status === 'fulfilled' && soilRes.value ? soilRes.value : { ...DEMO_SOIL, isDemo: true, source: 'demo' as const };
      const satellite = satelliteRes.status === 'fulfilled' && satelliteRes.value ? satelliteRes.value : { ...DEMO_SATELLITE, farmId, isDemo: true };

      const isDemo = !fromLiveFarm || weather.isDemo || soil.isDemo || satellite.isDemo;

      setCtx({
        farm,
        weather,
        soil,
        satellite,
        isDemo,
      });
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

  useEffect(() => {
    let cancelled = false;
    // Defer past the synchronous effect boundary so the initial render
    // isn't cascaded (react-hooks/set-state-in-effect).
    void Promise.resolve().then(() => { if (!cancelled) void load(); });
    return () => { cancelled = true; };
  }, [load]);

  return { ctx, loading, error, refresh: load };
}
