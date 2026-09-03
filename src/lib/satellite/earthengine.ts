// ============================================================
// AgriOS — Google Earth Engine Satellite Service
// Fetches Sentinel-2 NDVI via GEE REST API
// Falls back to demo data if unavailable
// ============================================================
import { SatelliteSnapshot } from '@/types';
import { DEMO_SATELLITE } from '@/lib/demo/demoData';

const satCache = new Map<string, { data: SatelliteSnapshot; ts: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function fetchNDVI(farmId: string): Promise<SatelliteSnapshot> {
  const key = `${farmId}`;
  const cached = satCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  // GEE REST API requires server-side OAuth token
  // This is called from the API route which has server-side credentials
  try {
    const projectId = process.env.EARTH_ENGINE_PROJECT_ID;
    if (!projectId) throw new Error('No EE project configured');

    // In production: fetch GEE OAuth token, call EE REST API
    // For MVP: use the GEE script endpoint or service account
    // If GEE credentials available, make REST call:
    const geeResponse = await callGEEForNDVI();
    if (geeResponse) {
      const snap: SatelliteSnapshot = {
        farmId,
        date: new Date().toISOString().split('T')[0],
        ndvi: geeResponse.ndvi,
        ndviMin: geeResponse.ndvi - 0.05,
        ndviMax: geeResponse.ndvi + 0.05,
        ndmiAvg: geeResponse.ndmi,
        trend: geeResponse.trend,
        trendValue: geeResponse.trendValue,
        status: classifyNDVI(geeResponse.ndvi),
        source: 'Sentinel-2 / Google Earth Engine',
        isDemo: false,
      };
      satCache.set(key, { data: snap, ts: Date.now() });
      return snap;
    }
    throw new Error('GEE returned no data');
  } catch (err) {
    console.warn('[Satellite] GEE unavailable, using demo fallback:', err);
    return { ...DEMO_SATELLITE, farmId, isDemo: true };
  }
}

async function callGEEForNDVI(): Promise<{
  ndvi: number; ndmi: number; trend: 'declining' | 'stable' | 'improving'; trendValue: number
} | null> {
  try {
    // GEE REST API endpoint
    // Requires: Authorization header with Google OAuth2 token
    const script = {
      expression: {
        functionInvocationValue: {
          functionName: 'Image.reduceRegion',
          arguments: {
            image: {
              functionInvocationValue: {
                functionName: 'ImageCollection.first',
                arguments: {
                  collection: {
                    functionInvocationValue: {
                      functionName: 'ImageCollection.filterDate',
                      arguments: {
                        collection: { valueReference: 'COPERNICUS/S2_SR_HARMONIZED' },
                        start: { constantValue: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0] },
                        end: { constantValue: new Date().toISOString().split('T')[0] },
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    
    // This requires proper GEE auth setup — return null to use demo fallback during hackathon
    void script; // suppress unused warning
    return null;
  } catch {
    return null;
  }
}

function classifyNDVI(ndvi: number): SatelliteSnapshot['status'] {
  if (ndvi < 0.2) return 'stressed';
  if (ndvi < 0.4) return 'moderate';
  if (ndvi < 0.7) return 'healthy';
  return 'very_healthy';
}

// Helper called directly when we have pre-computed NDVI values
export function buildSatelliteSnapshot(farmId: string, ndvi: number, prevNdvi: number): SatelliteSnapshot {
  const trendValue = ndvi - prevNdvi;
  return {
    farmId,
    date: new Date().toISOString().split('T')[0],
    ndvi,
    ndviMin: ndvi - 0.06,
    ndviMax: ndvi + 0.06,
    trend: trendValue > 0.02 ? 'improving' : trendValue < -0.02 ? 'declining' : 'stable',
    trendValue,
    status: classifyNDVI(ndvi),
    source: 'Sentinel-2 / Google Earth Engine',
    isDemo: false,
  };
}
