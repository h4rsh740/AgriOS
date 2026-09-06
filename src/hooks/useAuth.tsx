// ============================================================
// AgriOS — Auth Context + Hook
// ============================================================
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/firebase/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const demoUserStored = localStorage.getItem('agrios_demo_user');
      if (demoUserStored) {
        try {
          return JSON.parse(demoUserStored) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('agrios_demo_user')) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      // Don't overwrite if guest session is active
      if (typeof window !== 'undefined' && localStorage.getItem('agrios_demo_user')) return;
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
