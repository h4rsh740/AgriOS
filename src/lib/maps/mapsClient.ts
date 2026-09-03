// ============================================================
// AgriOS — Google Maps Client Helper
// Credit-aware: the app works with ZERO paid Google Cloud usage.
//  - Map display uses the free Google Maps embed URL.
//  - Place Autocomplete is only loaded when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
//    is configured (Maps JavaScript API + Places API).
// Never expose the API key anywhere other than NEXT_PUBLIC_ env.
// ============================================================

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export function isGoogleMapsConfigured(): boolean {
  return GOOGLE_MAPS_API_KEY.length > 0;
}

/**
 * Free Google Maps embed iframe URL (no API key required).
 * https://www.google.com/maps?q=lat,lng&z=zoom&output=embed
 */
export function buildMapsEmbedUrl(lat: number, lng: number, zoom = 14): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(`${lat.toFixed(5)},${lng.toFixed(5)}`)}&z=${zoom}&output=embed`;
}

declare global {
  interface Window {
    google?: {
      maps?: {
        Map?: unknown;
        places?: {
          Autocomplete?: new (input: HTMLInputElement, opts?: Record<string, unknown>) => {
            addListener?: (event: string, cb: (place: { geometry?: { location?: { lat?: () => number; lng?: () => number } } }) => void) => void;
            getPlace: () => { geometry?: { location?: { lat?: () => number; lng?: () => number } } };
          };
        };
      };
    };
  }
}

let mapsScriptPromise: Promise<boolean> | null = null;

/**
 * Lazy-loads the Google Maps JavaScript API (Places library) when a key is
 * configured. Resolves false when unconfigured, unsupported, or on failure —
 * never throws, so callers can always fall back to manual inputs.
 */
export function loadGoogleMaps(): Promise<boolean> {
  if (!isGoogleMapsConfigured()) return Promise.resolve(false);
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.google?.maps) return Promise.resolve(true);

  if (!mapsScriptPromise) {
    mapsScriptPromise = new Promise((resolve) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-agrios-maps]');
      if (existing) {
        existing.addEventListener('load', () => resolve(Boolean(window.google?.maps)));
        existing.addEventListener('error', () => { mapsScriptPromise = null; resolve(false); });
        return;
      }
      const script = document.createElement('script');
      script.dataset.agriosMaps = 'true';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly&loading=async&callback=__agriosMapsReady`;
      script.async = true;
      script.defer = true;
      const timeout = setTimeout(() => {
        mapsScriptPromise = null;
        resolve(false);
      }, 12000);
      script.onload = () => { clearTimeout(timeout); resolve(Boolean(window.google?.maps)); };
      script.onerror = () => { clearTimeout(timeout); mapsScriptPromise = null; resolve(false); };
      document.head.appendChild(script);
    });
  }
  return mapsScriptPromise;
}