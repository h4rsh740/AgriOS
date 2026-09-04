// ============================================================
// AgriOS — SoilGrids Soil Service (WCS + labeled fallback)
// ============================================================
import type { SoilProfile } from '@/types';

const DEFAULT_BENCHMARK_SOIL: SoilProfile = {
  ph: 7.8,
  organicCarbon: 0.48,
  sand: 42,
  silt: 35,
  clay: 23,
  bulkDensity: 1.32,
  nitrogen: 0.9,
  source: 'demo',
  fetchedAt: new Date().toISOString(),
  isDemo: true,
};

const soilCache = new Map<string, { data: SoilProfile; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function fetchSoilData(lat: number, lng: number): Promise<SoilProfile> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = soilCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    // SoilGrids REST API — if available
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lng}&lat=${lat}&property=phh2o&property=soc&property=sand&property=silt&property=clay&property=bdod&depth=0-30cm&value=mean`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`SoilGrids ${res.status}`);
    const raw = await res.json();

    const props = raw.properties?.layers;
    if (!props || !Array.isArray(props) || props.length === 0) {
      throw new Error('SoilGrids returned no layers for this location');
    }

    const getVal = (name: string) => {
      const layer = props.find((l: { name: string }) => l.name === name);
      return layer?.depths?.[0]?.values?.mean ?? null;
    };

    const phRaw = getVal('phh2o'); // phh2o in 10x pH units
    const socRaw = getVal('soc');   // g/kg * 10
    const sandRaw = getVal('sand'); // g/kg
    const siltRaw = getVal('silt');
    const clayRaw = getVal('clay');
    const bdRaw = getVal('bdod');   // cg/cm³

    // If critical fields are missing, treat as unavailable rather than fabricating live data
    if (phRaw === null && socRaw === null) {
      throw new Error('SoilGrids properties missing in response');
    }

    const soil: SoilProfile = {
      ph: phRaw !== null ? phRaw / 10 : 6.8,
      organicCarbon: socRaw !== null ? socRaw / 10 : 0.5,
      sand: sandRaw !== null ? sandRaw / 10 : 40,
      silt: siltRaw !== null ? siltRaw / 10 : 35,
      clay: clayRaw !== null ? clayRaw / 10 : 25,
      bulkDensity: bdRaw !== null ? bdRaw / 100 : 1.3,
      source: 'soilgrids',
      fetchedAt: new Date().toISOString(),
      isDemo: false,
    };

    soilCache.set(key, { data: soil, ts: Date.now() });
    return soil;
  } catch (err) {
    console.warn('[Soil] SoilGrids unavailable, using demo fallback:', err);
    return { ...DEFAULT_BENCHMARK_SOIL, isDemo: true, source: 'demo' };
  }
}

export function interpretSoil(soil: SoilProfile) {
  const phStatus =
    soil.ph < 5.5 ? 'acidic' :
    soil.ph < 6.5 ? 'slightly_acidic' :
    soil.ph < 7.5 ? 'neutral' :
    soil.ph < 8.5 ? 'slightly_alkaline' : 'alkaline';

  const socStatus =
    soil.organicCarbon < 0.5 ? 'very_low' :
    soil.organicCarbon < 1.0 ? 'low' :
    soil.organicCarbon < 2.0 ? 'medium' : 'high';

  const totalTexture = soil.sand + soil.silt + soil.clay;
  const sandPct = soil.sand / totalTexture * 100;
  const clayPct = soil.clay / totalTexture * 100;
  const textureClass =
    sandPct > 70 ? 'Sandy' :
    clayPct > 40 ? 'Clay' :
    clayPct > 27 && sandPct < 45 ? 'Clay Loam' : 'Loam';

  const overallHealth =
    (phStatus === 'neutral' || phStatus === 'slightly_acidic') && socStatus !== 'very_low' ? 'good' :
    socStatus === 'very_low' || phStatus === 'alkaline' || phStatus === 'acidic' ? 'poor' : 'fair';

  return { phStatus, socStatus, textureClass, overallHealth };
}
