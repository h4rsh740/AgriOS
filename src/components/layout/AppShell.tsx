'use client';
import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
      <Sidebar />
      <main className="main-area">
        {children}
      </main>
    </div>
  );
}
