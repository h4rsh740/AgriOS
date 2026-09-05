'use client';
// ============================================================
// AgriOS — Farm Location Picker
// Always shows a free Google Maps embed. Adds Places
// Autocomplete when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.
// Manual lat/lng inputs remain as fallback.
// ============================================================
import { useEffect, useRef, useState } from 'react';
import { MapPin, Search, LocateFixed, Check, Hexagon, Plus, Trash2 } from 'lucide-react';
import { FarmLocation, FarmBoundary } from '@/types';
import { buildMapsEmbedUrl, isGoogleMapsConfigured, loadGoogleMaps } from '@/lib/maps/mapsClient';

type LocationValue = Pick<FarmLocation, 'lat' | 'lng' | 'address' | 'state' | 'country' | 'boundary'>;

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

  const [activeTab, setActiveTab] = useState<'pin' | 'boundary'>('pin');
  const [newVertexLat, setNewVertexLat] = useState('');
  const [newVertexLng, setNewVertexLng] = useState('');

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
              ...value,
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
  }, [mapsReady, onChange, value]);

  function setDemoLocation() {
    onChange({
      ...value,
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

  // --- Boundary Polygon Helpers ---
  const boundaryCoords: [number, number][] = value.boundary?.coordinates || [];

  function autoGenerateBoundary() {
    if (!valid) return;
    // ~150m buffer in degrees (~0.0015 deg lat/lng)
    const d = 0.0015;
    const centerLat = value.lat;
    const centerLng = value.lng;
    // Standard GeoJSON Polygon ring: [lng, lat], closed (first = last)
    const polygon: FarmBoundary = {
      type: 'Polygon',
      coordinates: [
        [parseFloat((centerLng - d).toFixed(6)), parseFloat((centerLat - d).toFixed(6))],
        [parseFloat((centerLng + d).toFixed(6)), parseFloat((centerLat - d).toFixed(6))],
        [parseFloat((centerLng + d).toFixed(6)), parseFloat((centerLat + d).toFixed(6))],
        [parseFloat((centerLng - d).toFixed(6)), parseFloat((centerLat + d).toFixed(6))],
        [parseFloat((centerLng - d).toFixed(6)), parseFloat((centerLat - d).toFixed(6))],
      ],
    };
    onChange({ ...value, boundary: polygon });
    setBanner('4-corner boundary polygon generated around center.');
  }

  function addVertex() {
    const lat = parseFloat(newVertexLat);
    const lng = parseFloat(newVertexLng);
    if (!isValidLatLng(lat, lng)) {
      setBanner('Please enter valid latitude and longitude for the vertex.');
      return;
    }
    const updated: [number, number][] = [...boundaryCoords, [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))]];
    onChange({ ...value, boundary: { type: 'Polygon', coordinates: updated } });
    setNewVertexLat('');
    setNewVertexLng('');
    setBanner(`Vertex added (${lat.toFixed(4)}, ${lng.toFixed(4)}).`);
  }

  function removeVertex(index: number) {
    const updated: [number, number][] = boundaryCoords.filter((_: [number, number], i: number) => i !== index);
    onChange({
      ...value,
      boundary: updated.length > 0 ? { type: 'Polygon', coordinates: updated } : undefined,
    });
    setBanner('Vertex removed.');
  }

  function clearBoundary() {
    onChange({ ...value, boundary: undefined });
    setBanner('Boundary cleared.');
  }

  // Calculate SVG polygon points for visualizer
  const svgPoints = (() => {
    if (boundaryCoords.length < 3) return '';
    const lngs = boundaryCoords.map((c: [number, number]) => c[0]);
    const lats = boundaryCoords.map((c: [number, number]) => c[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const rangeLng = maxLng - minLng || 0.001;
    const rangeLat = maxLat - minLat || 0.001;
    const pad = 20;
    const width = 360;
    const height = 180;
    return boundaryCoords
      .map(([lng, lat]: [number, number]) => {
        const x = pad + ((lng - minLng) / rangeLng) * (width - 2 * pad);
        const y = height - (pad + ((lat - minLat) / rangeLat) * (height - 2 * pad));
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  })();

  return (
    <div>
      {/* Tab switch between Pin Location and Polygon Boundary */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'pin' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('pin')}
        >
          <MapPin size={13} /> Center Pin
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'boundary' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('boundary')}
        >
          <Hexagon size={13} /> Field Boundary
          {boundaryCoords.length > 0 && (
            <span
              style={{
                marginLeft: '6px',
                padding: '1px 6px',
                fontSize: '0.65rem',
                borderRadius: '10px',
                background: activeTab === 'boundary' ? 'rgba(255,255,255,0.25)' : 'var(--agrios-green-100)',
                color: activeTab === 'boundary' ? 'white' : 'var(--agrios-green-700)',
              }}
            >
              {boundaryCoords.length} pts
            </span>
          )}
        </button>
      </div>

      {activeTab === 'pin' ? (
        <>
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
        </>
      ) : (
        /* Field Boundary Mode */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Field Boundary (GeoJSON Polygon)</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Define multi-point polygon boundaries for satellite GEE parcel analytics.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={autoGenerateBoundary}
                disabled={!valid}
                title="Auto-calculate a 4-point bounding perimeter around the current center point"
              >
                <Hexagon size={13} /> Auto-Perimeter
              </button>
              {boundaryCoords.length > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-error"
                  onClick={clearBoundary}
                  title="Clear field polygon"
                >
                  <Trash2 size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* SVG Visualizer of Boundary Polygon */}
          <div
            style={{
              height: '180px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              background: 'radial-gradient(circle at center, #1b3d2b 0%, #0c2014 100%)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {boundaryCoords.length >= 3 ? (
              <svg width="100%" height="180" viewBox="0 0 360 180" style={{ display: 'block' }}>
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <polygon
                  points={svgPoints}
                  fill="rgba(46, 204, 113, 0.25)"
                  stroke="#2ecc71"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                {/* Render vertices dots */}
                {svgPoints.split(' ').map((pt: string, i: number) => {
                  const [x, y] = pt.split(',').map(Number);
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4" fill="#58d68d" stroke="#ffffff" strokeWidth="1.5" />
                      <text x={x + 6} y={y + 3} fontSize="9" fill="rgba(255,255,255,0.7)">
                        P{i + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                <Hexagon size={24} style={{ margin: '0 auto 6px auto', display: 'block', opacity: 0.4 }} />
                Click &ldquo;Auto-Perimeter&rdquo; or add at least 3 coordinates to render the farm boundary.
              </div>
            )}
          </div>

          {/* Vertex List / Input */}
          <div style={{ background: 'var(--surface-subtle)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
              Polygon Coordinates ({boundaryCoords.length} points)
            </div>

            {boundaryCoords.length > 0 && (
              <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {boundaryCoords.map(([lng, lat]: [number, number], idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <span>
                      <strong>P{idx + 1}:</strong> Lng {lng.toFixed(5)}, Lat {lat.toFixed(5)}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 6px', height: 'auto', color: 'var(--text-muted)' }}
                      onClick={() => removeVertex(idx)}
                      title="Remove point"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add manual vertex */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
              <div>
                <label className="label" style={{ fontSize: '0.7rem' }}>Lat</label>
                <input
                  type="number"
                  step="0.0001"
                  className="input"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  placeholder="26.8500"
                  value={newVertexLat}
                  onChange={(e) => setNewVertexLat(e.target.value)}
                />
              </div>
              <div>
                <label className="label" style={{ fontSize: '0.7rem' }}>Lng</label>
                <input
                  type="number"
                  step="0.0001"
                  className="input"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  placeholder="80.9500"
                  value={newVertexLng}
                  onChange={(e) => setNewVertexLng(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addVertex}
                style={{ height: '32px' }}
              >
                <Plus size={13} /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {banner && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px', padding: '10px 12px', background: 'var(--agrios-green-50)', border: '1px solid var(--agrios-green-200)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--agrios-green-700)' }}>
          <Check size={14} /> {banner}
        </div>
      )}
    </div>
  );
}