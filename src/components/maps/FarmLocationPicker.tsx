'use client';
// ============================================================
// AgriOS — Farm Location Picker
// Always shows a free Google Maps embed. Adds Places
// Autocomplete when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.
// Manual lat/lng inputs remain as fallback.
// ============================================================
import { useEffect, useRef, useState } from 'react';
import { MapPin, Search, LocateFixed, Check } from 'lucide-react';
import { FarmLocation } from '@/types';
import { buildMapsEmbedUrl, isGoogleMapsConfigured, loadGoogleMaps } from '@/lib/maps/mapsClient';

type LocationValue = Pick<FarmLocation, 'lat' | 'lng' | 'address' | 'state' | 'country'>;

interface FarmLocationPickerProps {
  value: LocationValue;
  onChange: (loc: LocationValue) => void;
  idPrefix?: string;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export default function FarmLocationPicker({ value, onChange, idPrefix = 'flp' }: FarmLocationPickerProps) {
  const [mapsConfigured] = useState(() => isGoogleMapsConfigured());
  const [mapsReady, setMapsReady] = useState(false);
  const [searching, setSearching] = useState(false);
  const [banner, setBanner] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<{ getPlace: () => { geometry?: { location?: { lat?: () => number; lng?: () => number } } } } | null>(null);

  const valid = isValidLatLng(value.lat, value.lng);
  const embedUrl = valid ? buildMapsEmbedUrl(value.lat, value.lng) : buildMapsEmbedUrl(26.85, 80.95);

  useEffect(() => {
    if (!mapsConfigured) return;
    let cancelled = false;
    loadGoogleMaps().then((ok) => { if (!cancelled) setMapsReady(ok); });
    return () => { cancelled = true; };
  }, [mapsConfigured]);

  // Wire Places Autocomplete once the Maps API is ready.
  useEffect(() => {
    if (!mapsReady || !searchInputRef.current) return;
    const AutocompleteCtor = window.google?.maps?.places?.Autocomplete;
    if (!AutocompleteCtor) return;
    // Capture ref so TypeScript can narrow to non-null inside the async closure
    const inputEl: HTMLInputElement = searchInputRef.current;
    let cancelled = false;
    (async () => {
      try {
        const auto = new AutocompleteCtor(inputEl, { types: ['geocode'] });
        auto.addListener?.('place_changed', () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const place = auto.getPlace() as any;
          const loc = place.geometry?.location;
          if (loc && typeof loc.lat === 'function' && typeof loc.lng === 'function') {
            onChange({
              lat: loc.lat(),
              lng: loc.lng(),
              address: place.formatted_address ? String(place.formatted_address) : searchInputRef.current?.value || undefined,
              country: value.country,
            });
            setBanner('Location set from Google Maps.');
          }
        });
        autocompleteRef.current = auto;
      } catch {
        if (!cancelled) setBanner('Maps autocomplete unavailable — use the coordinates below.');
      }
    })();
    return () => { cancelled = true; autocompleteRef.current = null; };
  }, [mapsReady, onChange, value.country]);

  function setDemoLocation() {
    onChange({
      lat: 26.85,
      lng: 80.95,
      address: 'Kumar Farm, Chinhat',
      state: 'Uttar Pradesh',
      country: 'India',
    });
    setBanner('Demo location (Lucknow, India) set.');
  }

  function handleCoord(coord: 'lat' | 'lng', raw: string) {
    const num = parseFloat(raw);
    onChange({ ...value, [coord]: Number.isNaN(num) ? 0 : num });
  }

  return (
    <div>
      {/* Search (only when Maps JS API configured) */}
      {mapsConfigured && (
        <div style={{ marginBottom: '12px' }}>
          <label className="label" htmlFor={`${idPrefix}-search`}>
            <Search size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
            Search a place on Google Maps
          </label>
          <input
            id={`${idPrefix}-search`}
            ref={searchInputRef}
            className="input"
            placeholder={mapsReady ? 'e.g. Chinhat, Lucknow' : 'Loading Google Maps…'}
            disabled={searching || !mapsReady}
            onFocus={() => setSearching(true)}
            onBlur={() => setSearching(false)}
            autoComplete="off"
          />
          {!mapsReady && mapsConfigured && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Google Maps Places — requires Maps JavaScript API enabled and configured in the Google Cloud Console.
            </div>
          )}
        </div>
      )}

      {/* Map embed (free — no API key needed) */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1.5px solid var(--border-default)',
          marginBottom: '8px',
        }}
      >
        <iframe
          title="Farm location map"
          src={embedUrl}
          width="100%"
          height="220"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        {!valid && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10,46,26,0.8)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            Enter coordinates or use &ldquo;Use demo location&rdquo; below to preview the farm map.
          </div>
        )}
      </div>

      {!mapsConfigured && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '8px' }}>
          Map preview via Google Maps embed. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for search and place selection.
        </div>
      )}

      <div className="data-source-label" style={{ marginBottom: '12px' }}>
        <MapPin size={11} /> {value.address ? `${value.address} · ` : ''}
        {value.state ? `${value.state} · ` : ''}
        {value.country} ({value.lat.toFixed(4)}, {value.lng.toFixed(4)})
      </div>

      {/* Manual coordinates + demo quick-set */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
        <div>
          <label className="label" htmlFor={`${idPrefix}-lat`}>Latitude</label>
          <input
            id={`${idPrefix}-lat`}
            className="input"
            type="number"
            step="0.0001"
            min={-90}
            max={90}
            inputMode="decimal"
            value={Number.isFinite(value.lat) ? value.lat.toFixed(5) : ''}
            onChange={(e) => handleCoord('lat', e.target.value)}
            aria-describedby={`${idPrefix}-coord-hint`}
          />
        </div>
        <div>
          <label className="label" htmlFor={`${idPrefix}-lng`}>Longitude</label>
          <input
            id={`${idPrefix}-lng`}
            className="input"
            type="number"
            step="0.0001"
            min={-180}
            max={180}
            inputMode="decimal"
            value={Number.isFinite(value.lng) ? value.lng.toFixed(5) : ''}
            onChange={(e) => handleCoord('lng', e.target.value)}
          />
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={setDemoLocation} style={{ whiteSpace: 'normal', lineHeight: 1.3 }}>
          <LocateFixed size={14} /> Use demo location
        </button>
      </div>
      <div id={`${idPrefix}-coord-hint`} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
        Prefer decimals with 5 digits for accuracy. For demo mode, the demo location is perfectly fine.
      </div>

      {banner && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px', padding: '10px 12px', background: 'var(--agrios-green-50)', border: '1px solid var(--agrios-green-200)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--agrios-green-700)' }}>
          <Check size={14} /> {banner}
        </div>
      )}
    </div>
  );
}