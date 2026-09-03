'use client';
import AppShell from '@/components/layout/AppShell';
import { useState, useRef } from 'react';
import { Microscope, Upload, X, AlertTriangle, Info, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { DiseaseAssessment } from '@/types';

export default function DiseasePage({ params }: { params: { id: string } }) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseAssessment | null>(null);
  const [error, setError] = useState('');
  const [showEvidence, setShowEvidence] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
    setError('');
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  }

  async function handleAnalyze() {
    setLoading(true); setError(''); setResult(null);
    try {
      const formData = new FormData();
      if (image) formData.append('image', image);
      formData.append('context', JSON.stringify({
        farmId: params.id,
        crop: 'Wheat',
        cropStage: 'vegetative',
        location: { state: 'Uttar Pradesh', country: 'India' },
        weather: { current: { temperature: 31, humidity: 72 }, risks: { diseaseRisk: 'high' } },
        ndvi: 0.58,
      }));

      const res = await fetch('/api/disease', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Analysis failed');
      const data: DiseaseAssessment = await res.json();
      setResult(data);
    } catch {
      setError('Disease analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const severityConfig = {
    low: { cls: 'badge-green', label: 'Low Severity' },
    moderate: { cls: 'badge-amber', label: 'Moderate Severity' },
    high: { cls: 'badge-red', label: 'High Severity' },
    critical: { cls: 'badge-red', label: 'Critical' },
  };

  return (
    <AppShell>
      <div style={{ padding: '28px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Microscope size={22} color="var(--agrios-amber-400)" />
          <h2 style={{ margin: 0 }}>Crop Disease Investigator</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.875rem' }}>
          Upload a crop photo for Gemini multimodal AI investigation. Farm context (weather, soil, NDVI) is automatically included.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '24px', maxWidth: result ? '1100px' : '600px' }}>
          {/* Upload panel */}
          <div>
            {/* Upload zone */}
            <div
              className="card"
              style={{
                border: `2px dashed ${image ? 'var(--agrios-green-400)' : 'var(--border-default)'}`,
                cursor: 'pointer',
                textAlign: 'center',
                padding: '32px',
                marginBottom: '16px',
                transition: 'all 0.2s',
                background: image ? 'var(--agrios-green-50)' : 'white',
              }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) { const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>; handleFile(fakeEvent); }
              }}
            >
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
              {preview ? (
                <div style={{ position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Crop preview" style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  <button
                    onClick={e => { e.stopPropagation(); setImage(null); setPreview(null); setResult(null); }}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ width: 60, height: 60, background: 'var(--agrios-amber-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Upload size={26} color="var(--agrios-amber-400)" />
                  </div>
                  <p style={{ fontWeight: 600, marginBottom: '8px' }}>Drop crop photo here or click to upload</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNG, JPG up to 5MB · Leaves, stems, roots, fruit</p>
                </>
              )}
            </div>

            {/* Context chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span className="badge badge-green">Wheat · Vegetative</span>
              <span className="badge badge-amber">Humidity 72% · Disease Risk High</span>
              <span className="badge badge-blue">NDVI 0.58</span>
            </div>

            {error && (
              <div style={{ background: 'var(--agrios-red-100)', border: '1px solid var(--agrios-red-400)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--agrios-red-600)' }}>
                {error}
              </div>
            )}

            <button
              id="analyze-disease-btn"
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            >
              {loading ? (
                <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Gemini is investigating...</>
              ) : (
                <><Microscope size={18} /> {image ? 'Analyze Crop Photo' : 'Analyze Without Photo'}</>
              )}
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px', lineHeight: 1.6 }}>
              Farm context (weather, NDVI, soil) is automatically sent with your photo for richer analysis.
            </p>
          </div>

          {/* Results panel */}
          {result && (
            <div>
              <div className="card" style={{ borderLeft: `4px solid ${result.severity === 'high' || result.severity === 'critical' ? 'var(--agrios-red-400)' : result.severity === 'moderate' ? 'var(--agrios-amber-400)' : 'var(--agrios-green-400)'}`, marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Likely Issue</div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{result.likelyIssue}</h3>
                  </div>
                  <span className={`badge ${severityConfig[result.severity].cls}`}>{severityConfig[result.severity].label}</span>
                </div>

                {/* Confidence */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Confidence</span>
                    <span style={{ fontWeight: 700, color: result.confidence >= 70 ? 'var(--agrios-green-700)' : '#92400e' }}>{result.confidence}%</span>
                  </div>
                  <div className="confidence-bar">
                    <div className="confidence-bar-fill" style={{ width: `${result.confidence}%`, background: result.confidence >= 70 ? 'var(--agrios-green-500)' : 'var(--agrios-amber-400)' }} />
                  </div>
                  {result.confidence < 70 && <div style={{ fontSize: '0.72rem', color: '#92400e', marginTop: '4px' }}>⚠ Low confidence — field verification especially important</div>}
                </div>

                {/* Recommended Action */}
                <div style={{ background: 'var(--agrios-green-50)', border: '1px solid var(--agrios-green-100)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--agrios-green-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Recommended Action</div>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-primary)', margin: 0 }}>{result.recommendedAction}</p>
                </div>

                {/* Symptoms */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Symptoms Noted</div>
                  {result.symptoms.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <div className="dot dot-amber" style={{ marginTop: '5px', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem' }}>{s}</span>
                    </div>
                  ))}
                </div>

                {/* Field verification steps */}
                <div style={{ background: 'var(--agrios-amber-100)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <AlertTriangle size={14} color="#92400e" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Field Verification Required</span>
                  </div>
                  {result.verificationSteps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <Check size={14} color="#92400e" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.82rem', color: '#78350f' }}>{step}</span>
                    </div>
                  ))}
                </div>

                {/* Expandable evidence */}
                <button
                  onClick={() => setShowEvidence(!showEvidence)}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {showEvidence ? <><ChevronUp size={14} /> Hide Evidence</> : <><ChevronDown size={14} /> Show Evidence & Alternatives</>}
                </button>

                {showEvidence && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Evidence Used</div>
                    {result.evidence.map((ev, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', padding: '10px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--agrios-sky-400)' }}>
                        <span className="badge badge-blue" style={{ fontSize: '0.6rem', flexShrink: 0 }}>{ev.type}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ev.description}</span>
                      </div>
                    ))}

                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', marginTop: '12px' }}>Alternative Diagnoses</div>
                    {result.alternatives.map((alt, i) => (
                      <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>• {alt}</div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '16px', padding: '10px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <Info size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  {result.disclaimer}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
