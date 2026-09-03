// ============================================================
// AgriOS — Farm Context Engine
// Centralized builder for the full AI input context:
// farm + crop + crop stage + soil + weather + satellite +
// alerts + regenerative score (+ demo fallbacks).
//
// Every AI feature (advisor, disease, roadmap, simulation)
// should consume FarmContext built here — never rebuild
// farm context inside individual components.
// ============================================================
import { FarmContext, Farm } from '@/types';
import { DEMO_FARM, DEMO_WEATHER, DEMO_SOIL, DEMO_SATELLITE, DEMO_ALERTS, DEMO_REGENERATIVE_SCORE } from '@/lib/demo/demoData';
import { fetchWeather } from '@/lib/weather/openmeteo';
import { fetchSoilData } from '@/lib/soil/soilgrids';
import { fetchNDVI } from '@/lib/satellite/earthengine';
import { getFarm, getFarmAlerts, getRegenerativeScore } from '@/lib/firebase/firestore';

/**
 * Resolves a farm by id, falling back to the canonical demo farm
 * when the farm does not exist in Firestore (or Firebase is unconfigured).
 */
export async function resolveFarm(farmId: string): Promise<{ farm: Farm; fromLive: boolean }> {
  try {
    const farm = await getFarm(farmId);
    if (farm) return { farm, fromLive: true };
  } catch {
    // Firebase not configured or unavailable — demo fallback.
  }
  return { farm: { ...DEMO_FARM, id: farmId }, fromLive: false };
}

/**
 * Builds the complete AI farm context.
 *
 * Every data source is fetched independently (Promise.allSettled) so a
 * single failing upstream API cannot crash context building. Each slice
 * carries its own `isDemo` flag and the final context exposes an overall
 * `isDemo` indicator for the UI to label DEMO DATA honestly.
 *
 * @param farmId - Firestore document id or 'demo'
 * @param opts.includeScore - include the regenerative score (heavier read)
 */
export async function buildFarmContext(
  farmId: string,
  opts: { includeScore?: boolean } = {}
): Promise<FarmContext> {
  const { farm, fromLive } = await resolveFarm(farmId);

  const [weather, soil, satellite] = await Promise.allSettled([
    fetchWeather(farm.location.lat, farm.location.lng),
    fetchSoilData(farm.location.lat, farm.location.lng),
    fetchNDVI(farmId),
  ]);

  const weatherData = weather.status === 'fulfilled' ? weather.value : { ...DEMO_WEATHER, isDemo: true };
  const soilData = soil.status === 'fulfilled' ? soil.value : { ...DEMO_SOIL, isDemo: true, source: 'demo' as const };
  const satelliteData = satellite.status === 'fulfilled' ? satellite.value : { ...DEMO_SATELLITE, farmId, isDemo: true };

  // Alerts & score are best-effort Firestore reads.
  let alerts = DEMO_ALERTS;
  let regenerativeScore = null;
  try {
    if (fromLive) {
      const liveAlerts = await getFarmAlerts(farmId);
      if (liveAlerts.length > 0) alerts = liveAlerts;
      if (opts.includeScore) regenerativeScore = await getRegenerativeScore(farmId);
    } else if (opts.includeScore) {
      regenerativeScore = DEMO_REGENERATIVE_SCORE;
    }
  } catch {
    // Keep demo values.
  }

  const isDemo = !fromLive || weatherData.isDemo || soilData.isDemo || satelliteData.isDemo;

  return {
    farm,
    weather: weatherData,
    soil: soilData,
    satellite: satelliteData,
    alerts,
    regenerativeScore,
    isDemo,
  };
}

/**
 * Shorthand for AI features that only need the core slices.
 */
export async function buildDemoContext(): Promise<FarmContext> {
  return buildFarmContext('demo-farm-001');
}