'use client';
// ============================================================
// AgriOS — Farmer Onboarding (7 steps + review)
// 1. Farmer profile  2. Farm location (Google Maps)
// 3. Farm size       4. Crop         5. Crop stage
// 6. Irrigation      7. Farming practices
// Saves to Firestore when configured; falls back to demo mode.
// ============================================================
import AppShell from '@/components/layout/AppShell';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Leaf, ArrowRight, ArrowLeft, Check, Loader2, User, MapPin, Ruler,
  Sprout, Droplets, Tractor, Info,
} from 'lucide-react';
import FarmLocationPicker from '@/components/maps/FarmLocationPicker';
import { createFarm } from '@/lib/firebase/firestore';
import { CropStage, IrrigationType, FarmingPractice, FarmLocation } from '@/types';

const CROPS = ['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Sugarcane', 'Potato', 'Tomato', 'Mustard', 'Other'];

const STAGES: { value: CropStage; label: string; hint: string }[] = [
  { value: 'germination', label: 'Germination', hint: 'Seeds sprouting, 0–2 weeks' },
  { value: 'seedling', label: 'Seedling', hint: 'Young plants, 2–4 weeks' },
  { value: 'vegetative', label: 'Vegetative', hint: 'Leaves and stems growing fast' },
  { value: 'flowering', label: 'Flowering', hint: 'Flowers / panicles appearing' },
  { value: 'grain_fill', label: 'Grain Fill', hint: 'Grains swelling, needs water' },
  { value: 'maturity', label: 'Maturity', hint: 'Ready to harvest soon' },
];

const IRRIGATION: { value: IrrigationType; label: string; hint: string }[] = [
  { value: 'rainfed', label: 'Rainfed', hint: 'No irrigation — relies on rain' },
  { value: 'drip', label: 'Drip', hint: 'Water delivered to roots' },
  { value: 'sprinkler', label: 'Sprinkler', hint: 'Water sprayed over crop' },
  { value: 'flood', label: 'Flood', hint: 'Field flooded with water' },
  { value: 'canal', label: 'Canal', hint: 'Water from canal network' },
  { value: 'borewell', label: 'Borewell', hint: 'Water pumped from well' },
];

const PRACTICES: { value: FarmingPractice; label: string; hint: string }[] = [
  { value: 'conventional', label: 'Conventional', hint: 'Standard inputs and tillage' },
  { value: 'organic', label: 'Organic', hint: 'No synthetic chemicals' },
  { value: 'integrated', label: 'Integrated', hint: 'Balanced IPM + inputs' },
  { value: 'regenerative', label: 'Regenerative', hint: 'Soil-first, cover crops, no-till' },
  { value: 'traditional', label: 'Traditional', hint: 'Local heritage methods' },
];

const STEP_META = [
  { icon: User, label: 'Farmer Profile' },
  { icon: MapPin, label: 'Farm Location' },
  { icon: Ruler, label: 'Farm Size' },
  { icon: Sprout, label: 'Crop' },
  { icon: Sprout, label: 'Crop Stage' },
  { icon: Droplets, label: 'Irrigation' },
  { icon: Tractor, label: 'Practices' },
  { icon: Check, label: 'Review' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [farmerName, setFarmerName] = useState(user?.displayName || '');
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState<Pick<FarmLocation, 'lat' | 'lng' | 'address' | 'state' | 'country'>>({
    lat: 26.85, lng: 80.95, address: '', state: 'Uttar Pradesh', country: 'India',
  });
  const [areaHa, setAreaHa] = useState('');
  const [crop, setCrop] = useState('Wheat');
  const [cropStage, setCropStage] = useState<CropStage>('vegetative');
  const [irrigation, setIrrigation] = useState<IrrigationType>('drip');
  const [practice, setPractice] = useState<FarmingPractice>('conventional');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [createdFarmId, setCreatedFarmId] = useState('demo-farm-001');
  const [usedDemo, setUsedDemo] = useState(false);

  const areaNum = parseFloat(areaHa);
  const locationValid = Number.isFinite(location.lat) && Number.isFinite(location.lng)
    && location.lat >= -90 && location.lat <= 90 && location.lng >= -180 && location.lng <= 180;

  function stepError(): string {
    if (step === 1 && farmerName.trim().length < 2) return 'Please enter your name (at least 2 characters).';
    if (step === 2 && !locationValid) return 'Please set a valid farm location (lat −90…90, lng −180…180).';
    if (step === 3 && (!Number.isFinite(areaNum) || areaNum <= 0)) return 'Please enter a farm size greater than 0 hectares.';
    if (step === 3 && areaNum > 10000) return 'That area looks too large — double-check the value in hectares.';
    return '';
  }

  const canContinue = stepError() === '';

  async function handleCreate() {
    setSaving(true); setError('');
    const newFarmData = {
      name: farmName.trim() || `${farmerName.trim()}'s Farm`,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || undefined,
        state: location.state || undefined,
        country: location.country,
      },
      areaHa: areaNum,
      crop,
      cropStage,
      irrigationType: irrigation,
      farmingPractice: practice,
    };

    try {
      const farmId = await createFarm(user?.uid || 'demo-user', {
        ...newFarmData,
        ownerId: user?.uid || 'demo-user',
      });
      setCreatedFarmId(farmId);
      // Also cache locally
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('agrios_local_farms') || '[]');
        existing.unshift({ id: farmId, ownerId: user?.uid || 'demo-user', ...newFarmData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        localStorage.setItem('agrios_local_farms', JSON.stringify(existing));
      }
    } catch {
      // Firebase not configured / offline — save locally so real input is preserved
      setUsedDemo(true);
      const localId = `farm-local-${Date.now()}`;
      setCreatedFarmId(localId);
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('agrios_local_farms') || '[]');
        existing.unshift({ id: localId, ownerId: user?.uid || 'demo-user', ...newFarmData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        localStorage.setItem('agrios_local_farms', JSON.stringify(existing));
      }
    } finally {
      setSaving(false);
      setCompleted(true);
    }
  }

  function openFarm() {
    router.push(`/farm/${createdFarmId}`);
  }

  return (
    <AppShell>
      <div style={{ padding: '28px', maxWidth: '760px', margin: '0 auto' }}>
{/* Header + progress */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ marginBottom: '8px' }}>{completed ? 'Farm Twin Created' : 'Create Your Farm Twin'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
            {completed
              ? 'Your Digital Twin is ready. Weather, soil, and satellite data will be fetched for your location.'
              : 'Answer 7 simple questions. You can edit everything later.'}
          </p>
          {!completed && (
            <div style={{ display: 'flex', gap: '0', alignItems: 'center', flexWrap: 'wrap' }}>
              {STEP_META.map((s, i) => {
                const stepNo = i + 1;
                const done = step > stepNo;
                const active = step === stepNo;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: done ? 'var(--agrios-green-500)' : active ? 'var(--agrios-green-700)' : 'var(--border-default)',
                      color: done || active ? 'white' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem',
                    }}>
                      {done ? <Check size={14} /> : stepNo}
                    </div>
                    <span style={{
                      margin: '0 8px', fontSize: '0.72rem', fontWeight: active ? 600 : 400,
                      color: active ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap',
                    }}>
                      {s.label}
                    </span>
                    {stepNo < STEP_META.length && (
                      <div style={{ width: 16, height: 2, background: done ? 'var(--agrios-green-400)' : 'var(--border-default)', marginRight: '8px' }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {completed ? (
          <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
            <div style={{ width: 72, height: 72, background: 'var(--agrios-green-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Leaf size={36} color="var(--agrios-green-600)" />
            </div>
            <h3 style={{ marginBottom: '8px' }}>Your Farm Twin is Ready</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.875rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
              Weather, soil, and satellite services will stream into your twin. Some data may remain in demo mode until live integrations are configured.
            </p>
            {usedDemo && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', textAlign: 'left', background: 'var(--agrios-amber-100)', border: '1px solid var(--agrios-amber-400)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '20px' }}>
                <Info size={15} color="#92400e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8rem', color: '#78350f', lineHeight: 1.6 }}>
                  Firebase is not configured in this environment, so this farm was created in <strong>demo mode</strong>.
                  Add the Firebase env keys to persist farms, observations, and recommendations.
                </div>
              </div>
            )}
            <button className="btn btn-primary btn-lg" onClick={openFarm} style={{ justifyContent: 'center' }}>
              Open Farm Dashboard <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="card">
{/* STEP 1 — Farmer profile */}
            {step === 1 && (
              <div role="group" aria-labelledby="step-1-title">
                <h3 id="step-1-title" style={{ marginBottom: '8px' }}>Farmer Profile</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '20px' }}>
                  Who is this farm twin for? We use this to personalize advice.
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label" htmlFor="farmer-name">Your full name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      id="farmer-name"
                      className="input"
                      placeholder="e.g. Ramesh Kumar"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="farm-name">Farm name (optional)</label>
                  <input
                    id="farm-name"
                    className="input"
                    placeholder="e.g. Kumar Farm"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 2 — Farm location */}
            {step === 2 && (
              <div role="group" aria-labelledby="step-2-title">
                <h3 id="step-2-title" style={{ marginBottom: '8px' }}>Farm Location</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '20px' }}>
                  Drag, search, or type the coordinates of your main field. Google Maps search appears when configured.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="label" htmlFor="farm-state">State / Region</label>
                    <input id="farm-state" className="input" placeholder="e.g. Uttar Pradesh" value={location.state || ''} onChange={(e) => setLocation((l) => ({ ...l, state: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label" htmlFor="farm-country">Country</label>
                    <input id="farm-country" className="input" placeholder="e.g. India" value={location.country} onChange={(e) => setLocation((l) => ({ ...l, country: e.target.value }))} />
                  </div>
                </div>
                <FarmLocationPicker idPrefix="onb" value={location} onChange={setLocation} />
              </div>
            )}

            {/* STEP 3 — Farm size */}
            {step === 3 && (
              <div role="group" aria-labelledby="step-3-title">
                <h3 id="step-3-title" style={{ marginBottom: '8px' }}>Farm Size</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '20px' }}>
                  Roughly how big is the field? Used to scale water, input, and satellite analysis.
                </p>
                <div>
                  <label className="label" htmlFor="farm-area">Area (hectares)</label>
                  <input
                    id="farm-area"
                    className="input"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    max="10000"
                    step="0.01"
                    placeholder="e.g. 2.4"
                    value={areaHa}
                    onChange={(e) => setAreaHa(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    1 hectare = 2.47 acres = about 2.5 football fields.
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 — Crop */}
            {step === 4 && (
              <div role="group" aria-labelledby="step-4-title">
                <h3 id="step-4-title" style={{ marginBottom: '8px' }}>Main Crop</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '20px' }}>
                  What are you growing this season?
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                  {CROPS.map((c) => (
                    <button key={c} type="button" onClick={() => setCrop(c)} aria-pressed={crop === c} className="btn" style={{
                      border: `1.5px solid ${crop === c ? 'var(--agrios-green-500)' : 'var(--border-default)'}`,
                      background: crop === c ? 'var(--agrios-green-50)' : 'white',
                      color: crop === c ? 'var(--agrios-green-700)' : 'var(--text-secondary)',
                      justifyContent: 'flex-start',
                    }}>
                      {crop === c && <Check size={14} />} <Sprout size={15} /> {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
{/* STEP 5 — Crop stage */}
            {step === 5 && (
              <div role="group" aria-labelledby="step-5-title">
                <h3 id="step-5-title" style={{ marginBottom: '8px' }}>Crop Stage</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '20px' }}>
                  What stage is the crop in right now? This drives stage-specific advice.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {STAGES.map((s) => (
                    <button key={s.value} type="button" onClick={() => setCropStage(s.value)} aria-pressed={cropStage === s.value} className="btn" style={{
                      justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column', whiteSpace: 'normal', textAlign: 'left', padding: '12px 14px',
                      border: `1.5px solid ${cropStage === s.value ? 'var(--agrios-green-500)' : 'var(--border-default)'}`,
                      background: cropStage === s.value ? 'var(--agrios-green-50)' : 'white',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: cropStage === s.value ? 'var(--agrios-green-700)' : 'var(--text-primary)' }}>
                        {cropStage === s.value && <Check size={14} />} {s.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>{s.hint}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6 — Irrigation */}
            {step === 6 && (
              <div role="group" aria-labelledby="step-6-title">
                <h3 id="step-6-title" style={{ marginBottom: '8px' }}>Irrigation</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '20px' }}>
                  How does the field get water? Used for water-efficiency scoring.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {IRRIGATION.map((irr) => (
                    <button key={irr.value} type="button" onClick={() => setIrrigation(irr.value)} aria-pressed={irrigation === irr.value} className="btn" style={{
                      justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column', whiteSpace: 'normal', textAlign: 'left', padding: '12px 14px',
                      border: `1.5px solid ${irrigation === irr.value ? 'var(--agrios-green-500)' : 'var(--border-default)'}`,
                      background: irrigation === irr.value ? 'var(--agrios-green-50)' : 'white',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: irrigation === irr.value ? 'var(--agrios-green-700)' : 'var(--text-primary)' }}>
                        {irrigation === irr.value && <Check size={14} />} {irr.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>{irr.hint}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
{/* STEP 7 — Farming practices */}
            {step === 7 && (
              <div role="group" aria-labelledby="step-7-title">
                <h3 id="step-7-title" style={{ marginBottom: '8px' }}>Farming Practices</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '20px' }}>
                  How do you farm today? This sets your regenerative baseline.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {PRACTICES.map((p) => (
                    <button key={p.value} type="button" onClick={() => setPractice(p.value)} aria-pressed={practice === p.value} className="btn" style={{
                      justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column', whiteSpace: 'normal', textAlign: 'left', padding: '12px 14px',
                      border: `1.5px solid ${practice === p.value ? 'var(--agrios-green-500)' : 'var(--border-default)'}`,
                      background: practice === p.value ? 'var(--agrios-green-50)' : 'white',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: practice === p.value ? 'var(--agrios-green-700)' : 'var(--text-primary)' }}>
                        {practice === p.value && <Check size={14} />} {p.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>{p.hint}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 8 — Review */}
            {step === 8 && (
              <div role="group" aria-labelledby="step-8-title">
                <h3 id="step-8-title" style={{ marginBottom: '8px' }}>Review Your Farm</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '20px' }}>
                  Almost done. Check the details below before creating your twin.
                </p>
                <div style={{ background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
                  {[
                    ['Farmer', farmerName],
                    ['Farm', farmName || `${farmerName}'s Farm`],
                    ['Crop', crop],
                    ['Stage', cropStage.replace('_', ' ')],
                    ['Area', `${areaNum ? areaNum.toFixed(2) : '—'} ha`],
                    ['Irrigation', irrigation],
                    ['Practice', practice],
                    ['Location', [location.address, location.state, location.country].filter(Boolean).join(', ')],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-muted)', fontSize: '0.83rem', textTransform: 'capitalize' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span style={{ fontWeight: 600, textAlign: 'right', marginLeft: '16px' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step navigation footer */}
            {error && (
              <div style={{ background: 'var(--agrios-red-100)', border: '1px solid var(--agrios-red-400)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginTop: '16px', fontSize: '0.83rem', color: 'var(--agrios-red-600)' }}>
                {error}
              </div>
            )}

            {!canContinue && stepError() && (
              <div style={{ background: 'var(--agrios-amber-100)', border: '1px solid var(--agrios-amber-400)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginTop: '16px', fontSize: '0.8rem', color: '#78350f' }}>
                {stepError()}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', borderTop: '1px solid var(--border-muted)', paddingTop: '20px' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                <ArrowLeft size={14} /> Back
              </button>

              {step < 8 ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canContinue}
                >
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleCreate}
                  disabled={saving}
                >
                  {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Creating Twin...</> : <><Leaf size={14} /> Create Farm Twin</>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}