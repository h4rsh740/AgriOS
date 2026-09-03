'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Leaf, Brain, Microscope, SlidersHorizontal, Globe, BarChart3,
  ArrowRight, Zap, Shield, Database, Satellite, Cloud, ChevronRight
} from 'lucide-react';

const TAGLINES = [
  'Sense. Understand. Simulate.',
  'Act. Learn. Share.',
  'Regenerate. Together.',
];

function TypingTagline() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % TAGLINES.length); setVisible(true); }, 400);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{
        color: 'var(--agrios-green-300)',
        transition: 'opacity 0.4s',
        opacity: visible ? 1 : 0,
        display: 'inline-block',
        minWidth: '320px',
      }}
    >
      {TAGLINES[idx]}
    </span>
  );
}

const FEATURES = [
  { icon: Satellite, title: 'Farm Digital Twin', desc: 'A live, AI-enriched model of your farm combining satellite imagery, soil data, weather, and crop observations.', color: 'var(--agrios-sky-600)' },
  { icon: Brain, title: 'AI Reasoning Engine', desc: 'Multi-agent Gemini AI analyzes every data signal and delivers explainable, evidence-backed recommendations.', color: 'var(--agrios-green-500)' },
  { icon: Microscope, title: 'Disease Investigator', desc: 'Upload a photo — Gemini multimodal AI investigates disease, stress, or pest issues in full farm context.', color: 'var(--agrios-amber-400)' },
  { icon: SlidersHorizontal, title: 'What-If Simulator', desc: 'Compare current vs. water-saving vs. regenerative scenarios before making costly decisions.', color: 'var(--agrios-soil-500)' },
  { icon: Leaf, title: 'Regenerative Score', desc: 'Track your farm\'s regenerative journey across 7 dimensions: soil, water, biodiversity, carbon and more.', color: 'var(--agrios-green-400)' },
  { icon: Globe, title: 'AgriMesh Network', desc: 'Exchange anonymized crop models and disease intelligence across BRICS agricultural nodes while keeping your data sovereign.', color: 'var(--agrios-sky-400)' },
];

const PROBLEMS = [
  { icon: Cloud, title: 'Weather data', desc: 'IMD, satellite, Open-Meteo — valuable but disconnected from soil and crop context.' },
  { icon: Database, title: 'Soil information', desc: 'SoilGrids, lab reports — sitting unused, not linked to real-time crop decisions.' },
  { icon: Satellite, title: 'Satellite signals', desc: 'Sentinel-2 NDVI tells you crop health — but not what to do about it.' },
];

const STATS = [
  { value: '8', label: 'AI Specialist Agents' },
  { value: '6', label: 'BRICS Countries' },
  { value: '₹0', label: 'Target Platform Cost' },
  { value: '7min', label: 'Full Demo Journey' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: 'var(--surface-base)', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? 'rgba(10,46,26,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, background: 'var(--agrios-green-500)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Leaf size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>AgriOS</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/login" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
              Sign In
            </Link>
            <Link href="/login" className="btn btn-primary btn-sm">
              Create Farm Twin <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(160deg, var(--agrios-green-900) 0%, var(--agrios-green-800) 60%, #162e1e 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 25% 35%, rgba(45,155,90,0.12) 0%, transparent 50%), radial-gradient(circle at 75% 65%, rgba(56,189,248,0.08) 0%, transparent 50%)`,
        }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
          {/* Tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(45,155,90,0.2)', border: '1px solid rgba(45,155,90,0.4)', borderRadius: 'var(--radius-full)', padding: '6px 16px', marginBottom: '32px' }}>
            <Zap size={13} color="var(--agrios-green-300)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--agrios-green-200)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Google BRICS Hackathon 2026</span>
          </div>

          <h1 style={{ color: 'white', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '20px', maxWidth: '860px', margin: '0 auto 20px' }}>
            The Open Intelligence Layer for<br />
            <span style={{ color: 'var(--agrios-green-300)' }}>Regenerative Agriculture</span>
          </h1>

          <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.75)', marginBottom: '12px', height: '32px' }}>
            <TypingTagline />
          </div>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', marginBottom: '40px', maxWidth: '580px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Every farm gets a Digital Twin powered by Gemini AI, Google Earth Engine, and real agricultural data. Not a chatbot — an intelligent farm operating system.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '56px' }}>
            <Link href="/login" className="btn btn-primary btn-lg">
              <Leaf size={18} /> Create Your Farm Twin
            </Link>
            <Link href="/agrimesh" className="btn btn-lg" style={{ border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', background: 'transparent' }}>
              Explore AgriMesh <Globe size={16} />
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', maxWidth: '640px', margin: '0 auto', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.15)', padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--agrios-green-300)' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Powered by */}
          <div style={{ marginTop: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', flexWrap: 'wrap' }}>
            <span>Powered by</span>
            {['Gemini AI', 'Google Earth Engine', 'Firebase', 'Google Maps'].map((s, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{s}</span>
                {i < 3 && <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ background: 'white', padding: 'var(--space-20) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div className="section-label" style={{ color: 'var(--agrios-red-600)', marginBottom: '12px' }}>The Problem</div>
            <h2 style={{ marginBottom: '16px' }}>Agricultural intelligence is fragmented</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
              Farmers have access to data — but it lives in silos, disconnected from each other and from actionable decisions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto 48px' }}>
            {PROBLEMS.map((p, i) => (
              <div key={i} className="card card-dark" style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <p.icon size={24} color="var(--agrios-green-300)" />
                </div>
                <h4 style={{ color: 'white', marginBottom: '8px' }}>{p.title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--agrios-red-100)', border: '1px solid var(--agrios-red-400)', borderRadius: 'var(--radius-full)', padding: '10px 24px', color: 'var(--agrios-red-600)', fontWeight: 600, fontSize: '0.875rem' }}>
              ⬇ Without integration: late decisions, crop losses, missed opportunities
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={{ background: 'var(--agrios-green-50)', padding: 'var(--space-20) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div className="section-label" style={{ color: 'var(--agrios-green-700)', marginBottom: '12px' }}>The Solution</div>
            <h2 style={{ marginBottom: '16px' }}>AgriOS unifies it all into one Farm Twin</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
              One platform that connects satellite data, weather, soil, AI reasoning, and cooperative intelligence into a living digital model of every farm.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card" style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{
                  width: 48, height: 48,
                  background: `${f.color}18`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h4 style={{ marginBottom: '8px' }}>{f.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{f.desc}</p>
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--agrios-green-700)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                  Learn more <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section style={{ background: 'white', padding: 'var(--space-20) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="section-label" style={{ marginBottom: '12px' }}>Google-First Architecture</div>
            <h2>Built on the Google Intelligence Stack</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
            {[
              { name: 'Gemini AI', role: 'Multi-agent reasoning engine', icon: Brain, color: 'var(--agrios-green-500)' },
              { name: 'Google Earth Engine', role: 'Sentinel-2 satellite intelligence', icon: Satellite, color: 'var(--agrios-sky-600)' },
              { name: 'Google Maps', role: 'Farm geospatial UX', icon: Globe, color: 'var(--agrios-soil-500)' },
              { name: 'Firebase', role: 'Identity + operational data', icon: Shield, color: 'var(--agrios-amber-400)' },
              { name: 'Cloud Run', role: 'Secure AI orchestration', icon: Zap, color: 'var(--agrios-green-400)' },
              { name: 'BigQuery', role: 'Analytical scale', icon: BarChart3, color: 'var(--agrios-sky-400)' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                background: 'var(--surface-muted)', gap: '10px'
              }}>
                <div style={{ width: 44, height: 44, background: `${item.color}18`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={20} color={item.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--agrios-green-900) 0%, var(--agrios-green-800) 100%)', padding: 'var(--space-20) 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ color: 'white', marginBottom: '16px', fontSize: '2.2rem' }}>
              Join the future of agricultural intelligence
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '40px', fontSize: '1.05rem' }}>
              Create your Farm Twin in minutes. Connect your field data. Get AI-powered insights that actually make sense for your farm.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg" style={{ fontSize: '1rem' }}>
              <Leaf size={20} /> Create Your Farm Twin — Free
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--agrios-green-950)', padding: '32px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: 28, height: 28, background: 'var(--agrios-green-700)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={15} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--agrios-green-200)' }}>AgriOS</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
            Powered by Gemini AI · Google Earth Engine · Firebase · Google Maps Platform
          </p>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: '8px' }}>
            Google BRICS Hackathon 2026 · Open Intelligence Layer for Regenerative Agriculture
          </p>
        </div>
      </footer>
    </div>
  );
}
