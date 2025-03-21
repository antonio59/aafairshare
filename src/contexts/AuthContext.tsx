'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { CookieMethods } from '@supabase/ssr';

type AuthContextType = {
  user: null | { id: string; email: string };
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<null | { id: string; email: string }>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Create a custom Supabase client with specific cookie options for auth context
  const cookieMethods: CookieMethods = {
    get(name: string) {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`))
        ?.split('=')[1];
    },
    set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; sameSite?: string; secure?: boolean }) {
      document.cookie = `${name}=${value}; path=${options.path || '/'}; max-age=${options.maxAge || 3600}`;
    },
    remove(name: string, options: { path?: string; domain?: string }) {
      document.cookie = `${name}=; path=${options.path || '/'}; max-age=0`;
    }
  };

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieMethods,
      cookieOptions: {
        name: 'sb-session',
        path: '/',
        domain: '',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      if (session) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    router.refresh();
  };

  const register = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    router.refresh();
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    // Clear any cached data
    localStorage.clear();
    sessionStorage.clear();
    // Force a complete page reload to clear all state
    window.location.href = '/signin';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);