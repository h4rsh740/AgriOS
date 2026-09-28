'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOutUser } from '@/lib/firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Leaf, LayoutDashboard, Satellite, CloudRain, Layers,
  Microscope, SlidersHorizontal, Repeat2, MapPin, Globe,
  Settings, LogOut, ChevronRight, Bell, Sparkles, X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const NAV_ITEMS = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), key: 'dashboard' },
    { href: '/farm', icon: Layers, label: t('nav.farm_twin'), group: 'farm' },
    { href: '/farm/demo-farm-001/advisor', icon: Sparkles, label: t('nav.ai_advisor') },
    { href: '/farm/demo-farm-001/weather', icon: CloudRain, label: t('nav.weather') },
    { href: '/farm/demo-farm-001/satellite', icon: Satellite, label: t('nav.satellite') },
    { href: '/farm/demo-farm-001/disease', icon: Microscope, label: t('nav.disease') },
    { href: '/farm/demo-farm-001/simulate', icon: SlidersHorizontal, label: t('nav.simulate') },
    { href: '/farm/demo-farm-001/regenerative', icon: Repeat2, label: t('nav.regenerative') },
    { href: '/farm/demo-farm-001/roadmap', icon: MapPin, label: t('nav.roadmap') },
    { href: '/agrimesh', icon: Globe, label: t('nav.agrimesh'), dividerBefore: true },
    { href: '/settings', icon: Settings, label: t('nav.settings'), dividerBefore: true },
  ];

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' :
    pathname.startsWith(href);

  async function handleSignOut() {
    await signOutUser();
    onClose?.();
    router.push('/');
  }

  const handleLinkClick = () => {
    onClose?.();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo & Mobile Close */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/dashboard" onClick={handleLinkClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'var(--agrios-green-500)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Leaf size={19} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'white', fontSize: '1.05rem', lineHeight: 1 }}>AgriOS</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--agrios-green-300)', fontWeight: 500, marginTop: '2px' }}>
              {t('app.tagline')}
            </div>
          </div>
        </Link>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Global Language Switcher in Sidebar */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 500 }}>
            <Globe size={13} color="var(--agrios-green-400)" />
            <span>{t('app.language')}:</span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              onClick={() => setLanguage('en')}
              style={{
                background: language === 'en' ? 'var(--agrios-green-500)' : 'transparent',
                color: language === 'en' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 9px',
                fontSize: '0.75rem',
                fontWeight: language === 'en' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              style={{
                background: language === 'hi' ? 'var(--agrios-green-500)' : 'transparent',
                color: language === 'hi' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 9px',
                fontSize: '0.75rem',
                fontWeight: language === 'hi' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item, i) => {
          const active = isActive(item.href);
          return (
            <div key={i}>
              {item.dividerBefore && <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '8px 0' }} />}
              <Link
                href={item.href}
                onClick={handleLinkClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: active ? 'white' : 'rgba(255,255,255,0.6)',
                  background: active ? 'rgba(45,155,90,0.25)' : 'transparent',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.865rem',
                  transition: 'all 0.15s ease',
                  marginBottom: '2px',
                  borderLeft: active ? '2px solid var(--agrios-green-400)' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; } }}
              >
                <item.icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Active farm chip */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ background: 'rgba(45,155,90,0.15)', border: '1px solid rgba(45,155,90,0.3)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--agrios-green-300)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>
            {t('app.active_farm')}
          </div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
            {language === 'hi' ? 'डेमो खेत' : 'Demo Farm'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
            {language === 'hi' ? 'गेहूं · लखनऊ, भारत' : 'Wheat · Lucknow, India'}
          </div>
        </div>

        {/* Alerts indicator */}
        <Link href="/dashboard" onClick={handleLinkClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', marginBottom: '8px', background: 'rgba(251,191,36,0.1)', textDecoration: 'none' }}>
          <Bell size={14} color="var(--agrios-amber-400)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--agrios-amber-400)', fontWeight: 500 }}>
            2 {t('app.alerts')}
          </span>
          <div style={{ marginLeft: 'auto', width: 8, height: 8, background: 'var(--agrios-amber-400)', borderRadius: '50%' }} />
        </Link>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, background: 'var(--agrios-green-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
              {user?.displayName?.[0] || user?.email?.[0] || 'F'}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.displayName || user?.email?.split('@')[0] || (language === 'hi' ? 'किसान' : 'Farmer')}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
              {t('app.farmer')}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title={t('app.sign_out')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px', borderRadius: '4px' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
