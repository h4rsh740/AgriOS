'use client';
import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Menu, Leaf, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Prevent background scrolling when mobile nav is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--agrios-green-900)' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} color="var(--agrios-green-400)" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Loading AgriOS...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app-shell">
      {/* Mobile Top App Bar (< 768px) */}
      <header className="mobile-header">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="mobile-hamburger-btn"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} color="white" />
        </button>

        <div className="mobile-brand">
          <div className="mobile-brand-icon">
            <Leaf size={16} color="white" />
          </div>
          <span className="mobile-brand-title">AgriOS</span>
        </div>

        {/* Quick Language Toggle on Mobile */}
        <div className="mobile-actions">
          <button
            onClick={toggleLanguage}
            className="mobile-lang-btn"
            title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
          >
            <Globe size={13} />
            <span>{language === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>

          <div className="mobile-avatar">
            {user?.displayName?.[0] || user?.email?.[0] || 'F'}
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isMobileNavOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile Slide-over Drawer) */}
      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <main className="main-area">
        {children}
      </main>
    </div>
  );
}
