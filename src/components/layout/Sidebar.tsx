'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOutUser } from '@/lib/firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Leaf, LayoutDashboard, Satellite, CloudRain, Layers,
  Microscope, SlidersHorizontal, Repeat2, MapPin, Globe,
  Settings, LogOut, ChevronRight, Bell
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/farm', icon: Layers, label: 'Farm Twin', group: 'farm' },
  { href: '/farm/demo-farm-001/weather', icon: CloudRain, label: 'Weather' },
  { href: '/farm/demo-farm-001/satellite', icon: Satellite, label: 'Satellite / NDVI' },
  { href: '/farm/demo-farm-001/disease', icon: Microscope, label: 'Disease Investigator' },
  { href: '/farm/demo-farm-001/simulate', icon: SlidersHorizontal, label: 'What-If' },
  { href: '/farm/demo-farm-001/regenerative', icon: Repeat2, label: 'Regenerative' },
  { href: '/farm/demo-farm-001/roadmap', icon: MapPin, label: 'Roadmap' },
  { href: '/agrimesh', icon: Globe, label: 'AgriMesh', dividerBefore: true },
  { href: '/settings', icon: Settings, label: 'Settings', dividerBefore: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' :
    pathname.startsWith(href);

  async function handleSignOut() {
    await signOutUser();
    router.push('/');
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'var(--agrios-green-500)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Leaf size={19} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'white', fontSize: '1.05rem', lineHeight: 1 }}>AgriOS</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--agrios-green-300)', fontWeight: 500, marginTop: '2px' }}>Intelligence Platform</div>
          </div>
        </Link>
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

      {/* Demo farm chip */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ background: 'rgba(45,155,90,0.15)', border: '1px solid rgba(45,155,90,0.3)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--agrios-green-300)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Active Farm</div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>Demo Farm</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Wheat · Lucknow, India</div>
        </div>

        {/* Alerts indicator */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', marginBottom: '8px', background: 'rgba(251,191,36,0.1)', textDecoration: 'none' }}>
          <Bell size={14} color="var(--agrios-amber-400)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--agrios-amber-400)', fontWeight: 500 }}>2 active alerts</span>
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
              {user?.displayName || user?.email?.split('@')[0] || 'Farmer'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Farmer</div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
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
