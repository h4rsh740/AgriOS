'use client';
import { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Leaf, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogle() {
    setError(''); setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      router.push('/dashboard');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Authentication failed';
      setError(msg.includes('user-not-found') ? 'No account found with this email.' :
               msg.includes('wrong-password') ? 'Incorrect password.' :
               msg.includes('email-already-in-use') ? 'Email already registered.' :
               msg.includes('weak-password') ? 'Password must be at least 6 characters.' :
               'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(160deg, var(--agrios-green-900) 0%, var(--agrios-green-800) 100%)',
    }}>
      {/* Left panel — branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 60px', maxWidth: '520px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
          <div style={{ width: 40, height: 40, background: 'var(--agrios-green-500)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={22} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.3rem', color: 'white' }}>AgriOS</span>
        </Link>

        <h1 style={{ color: 'white', fontSize: '2.2rem', marginBottom: '16px', lineHeight: 1.2 }}>
          Your farm&apos;s intelligence, unified.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '40px', fontSize: '1rem' }}>
          Create a Digital Twin for your farm. Get AI-powered insights from Gemini, satellite data from Google Earth Engine, and weather intelligence — all in one place.
        </p>

        {['Farm Digital Twin', 'Multi-agent AI Advisor', 'Gemini Disease Investigation', 'What-If Simulator', 'Regenerative Score'].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: 6, height: 6, background: 'var(--agrios-green-400)', borderRadius: '50%', flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--surface-base)' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Tab toggle */}
          <div style={{ display: 'flex', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '32px' }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  background: mode === m ? 'white' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: mode === m ? 600 : 400,
                  fontFamily: 'var(--font-body)',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s',
                  fontSize: '0.875rem',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <h2 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.875rem' }}>
            {mode === 'login' ? 'Sign in to access your Farm Twin' : 'Get started with your free Farm Twin'}
          </p>

          {/* Google */}
          <button
            id="google-signin-btn"
            onClick={handleGoogle}
            disabled={loading}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '20px', padding: '12px' }}
          >
            <GoogleIcon size={18} />
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-muted)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>or with email</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-muted)' }} />
          </div>

          {error && (
            <div style={{ background: 'var(--agrios-red-100)', border: '1px solid var(--agrios-red-400)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="var(--agrios-red-600)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--agrios-red-600)' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmail}>
            {mode === 'signup' && (
              <div style={{ marginBottom: '16px' }}>
                <label className="label" htmlFor="name-input">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="name-input"
                    type="text"
                    className="input"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label className="label" htmlFor="email-input">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="email-input"
                  type="email"
                  className="input"
                  placeholder="you@farm.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="label" htmlFor="password-input">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="password-input"
                  type="password"
                  className="input"
                  placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              id="email-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            By continuing you agree to AgriOS&apos;s data-sovereign approach. Your raw farm data never leaves your governed environment.
          </p>
        </div>
      </div>
    </div>
  );
}
