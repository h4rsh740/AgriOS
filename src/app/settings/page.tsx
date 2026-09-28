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
import { useLanguage } from '@/hooks/useLanguage';

export default function SettingsPage() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    weatherAlerts: true,
    pestRisk: true,
    mandiPriceMovements: true,
    schemeUpdates: false,
  });

  function handleSaveLanguage(newLang: 'hi' | 'en') {
    setLanguage(newLang);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell>
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Settings size={24} color="var(--agrios-green-600)" />
          <h2 style={{ margin: 0 }}>{t('settings.title')}</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.875rem' }}>
          {t('settings.subtitle')}
        </p>

        {/* 1. Language Preferences */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Globe size={18} color="var(--agrios-sky-600)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{t('settings.lang_heading')}</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {t('settings.lang_desc')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
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
                cursor: 'pointer',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '1rem', color: language === 'en' ? 'var(--agrios-green-700)' : 'var(--text-primary)' }}>
                {t('settings.english')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('settings.english_desc')}
              </span>
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
                cursor: 'pointer',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '1rem', color: language === 'hi' ? 'var(--agrios-green-700)' : 'var(--text-primary)' }}>
                {t('settings.hindi')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('settings.hindi_desc')}
              </span>
            </button>
          </div>

          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--agrios-green-600)', fontSize: '0.8rem', marginTop: '14px', fontWeight: 600 }}>
              <Check size={16} /> {t('settings.lang_saved')}
            </div>
          )}
        </div>

        {/* 2. Notification Preferences */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Bell size={18} color="var(--agrios-amber-400)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{t('settings.alerts_heading')}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'weatherAlerts', title: t('settings.weather_alerts'), desc: t('settings.weather_desc') },
              { key: 'pestRisk', title: t('settings.pest_alerts'), desc: t('settings.pest_desc') },
              { key: 'mandiPriceMovements', title: t('settings.mandi_alerts'), desc: t('settings.mandi_desc') },
              { key: 'schemeUpdates', title: t('settings.scheme_alerts'), desc: t('settings.scheme_desc') },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-muted)', paddingBottom: '12px', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={e => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  style={{ accentColor: 'var(--agrios-green-500)', width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Farmer Profile */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <User size={18} color="var(--agrios-green-600)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{t('settings.profile_heading')}</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {t('settings.display_name')}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.displayName || t('settings.demo_farmer')}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.email || 'farmer@agrios.ai'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {t('settings.active_lang')}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{language === 'hi' ? 'हिंदी (Hindi)' : 'English'}</div>
            </div>
          </div>
        </div>

        {/* 4. System Telemetry & Model Engine */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Cpu size={18} color="var(--agrios-soil-500)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{t('settings.system_heading')}</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Google Cloud Vertex AI', status: 'Connected', sub: 'Gemini 2.5 Flash' },
              { label: 'Open-Meteo Weather API', status: 'Live', sub: '15-min Telemetry interval' },
              { label: 'Data.gov.in Mandi APMC', status: 'Syncing', sub: 'Daily price feeds' },
              { label: 'ISRO / Copernicus NDVI', status: 'Operational', sub: '10m Sentinel-2 Resolution' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-muted)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{s.label}</span>
                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>{s.status}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
