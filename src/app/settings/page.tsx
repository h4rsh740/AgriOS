'use client';
// ============================================================
// AgriOS — Farmer Settings & Preferences
// Language, notifications, profile, and system status
// ============================================================
import AppShell from '@/components/layout/AppShell';
import { useState } from 'react';
import { Settings, Globe, Bell, User, Cpu, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOutUser } from '@/lib/firebase/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<'hi' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('agrios_preferred_language') as 'hi' | 'en') || 'en';
    }
    return 'en';
  });
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    weatherAlerts: true,
    pestRisk: true,
    mandiPriceMovements: true,
    schemeUpdates: false,
  });

  function handleSaveLanguage(newLang: 'hi' | 'en') {
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrios_preferred_language', newLang);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AppShell>
      <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Settings size={24} color="var(--agrios-green-600)" />
          <h2 style={{ margin: 0 }}>Farmer Settings</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.875rem' }}>
          Manage your language, notification preferences, and system connectivity.
        </p>

        {/* 1. Language Preferences */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Globe size={18} color="var(--agrios-sky-600)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Language / भाषा</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Choose the language for AI agricultural advice, alerts, and voice interaction.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => handleSaveLanguage('en')}
              className="btn"
              style={{
                border: `2px solid ${language === 'en' ? 'var(--agrios-green-500)' : 'var(--border-default)'}`,
                background: language === 'en' ? 'var(--agrios-green-50)' : 'white',
                padding: '14px',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '1rem', color: language === 'en' ? 'var(--agrios-green-700)' : 'var(--text-primary)' }}>English</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Default interface language</span>
            </button>

            <button
              onClick={() => handleSaveLanguage('hi')}
              className="btn"
              style={{
                border: `2px solid ${language === 'hi' ? 'var(--agrios-green-500)' : 'var(--border-default)'}`,
                background: language === 'hi' ? 'var(--agrios-green-50)' : 'white',
                padding: '14px',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '1rem', color: language === 'hi' ? 'var(--agrios-green-700)' : 'var(--text-primary)' }}>हिंदी (Hindi)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>भारतीय किसानों के लिए हिंदी अनुवाद</span>
            </button>
          </div>

          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--agrios-green-600)', fontSize: '0.8rem', marginTop: '12px' }}>
              <Check size={14} /> Language preference saved.
            </div>
          )}
        </div>

        {/* 2. Notification Preferences */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Bell size={18} color="var(--agrios-amber-400)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Agricultural Alerts</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'weatherAlerts', title: 'Severe Weather Warnings', desc: 'Heavy rainfall, frost, and heat stress alerts' },
              { key: 'pestRisk', title: 'Pest & Disease Advisory', desc: 'Microclimate triggers for foliar fungi or insect surges' },
              { key: 'mandiPriceMovements', title: 'Mandi Price Movements', desc: 'Alerts when nearby APMC prices cross MSP thresholds' },
              { key: 'schemeUpdates', title: 'Government Schemes & Subsidies', desc: 'Deadlines for PM-KISAN, PMFBY, and input subsidies' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-muted)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={e => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. System & API Diagnostics */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Cpu size={18} color="var(--agrios-green-600)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>System & Intelligence Integrations</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gemini 3.6 Flash</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--agrios-green-700)', marginTop: '2px' }}>● Connected</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Open-Meteo Weather</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--agrios-green-700)', marginTop: '2px' }}>● Active (15m Cache)</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SoilGrids ISRIC</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--agrios-green-700)', marginTop: '2px' }}>● Active</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Google Earth Engine</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--agrios-amber-400)', marginTop: '2px' }}>○ Key Optional (Benchmark Mode)</div>
            </div>
          </div>
        </div>

        {/* 4. Farmer Account */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <User size={18} color="var(--text-muted)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Farmer Account</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.displayName || 'Active Farmer'}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email || 'Offline session mode'}</div>
            </div>
            {user && (
              <button onClick={() => void signOutUser()} className="btn btn-outline btn-sm" style={{ color: 'var(--agrios-red-600)' }}>
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
