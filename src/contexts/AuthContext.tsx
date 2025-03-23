'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const VALID_COOKIE_NAME_REGEX = /^[\w!#$%&'*.^`|~+-]+$/;
const VALID_COOKIE_PATH_REGEX = /^[\w!#$%&'()*+,-./:=@~_]+$/;
const VALID_COOKIE_DOMAIN_REGEX = /^[a-z0-9-_.]+$/i;

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
  
  // Use the standardized browser client to ensure consistent cookie handling across the app
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (!VALID_COOKIE_NAME_REGEX.test(name)) {
            console.error('Invalid cookie name');
            return undefined;
          }
          const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1];
          return value ? decodeURIComponent(value) : undefined;
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string }) {
          if (!VALID_COOKIE_NAME_REGEX.test(name)) {
            throw new Error('Invalid cookie name');
          }
          if (options.path && !VALID_COOKIE_PATH_REGEX.test(options.path)) {
            throw new Error('Invalid cookie path');
          }
          if (options.domain && !VALID_COOKIE_DOMAIN_REGEX.test(options.domain)) {
            throw new Error('Invalid cookie domain');
          }
          const encodedValue = encodeURIComponent(value);
          const path = options.path || '/';
          const domain = options.domain ? `; domain=${options.domain}` : '';
          // Ensure consistent cookie settings with middleware
          document.cookie = `${name}=${encodedValue}; path=${path}${domain}; max-age=${options.maxAge || 7 * 24 * 60 * 60}; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`;
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          if (!VALID_COOKIE_NAME_REGEX.test(name)) {
            throw new Error('Invalid cookie name');
          }
          if (options.path && !VALID_COOKIE_PATH_REGEX.test(options.path)) {
            throw new Error('Invalid cookie path');
          }
          if (options.domain && !VALID_COOKIE_DOMAIN_REGEX.test(options.domain)) {
            throw new Error('Invalid cookie domain');
          }
          const path = options.path || '/';
          const domain = options.domain ? `; domain=${options.domain}` : '';
          document.cookie = `${name}=; path=${path}${domain}; max-age=0; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`;
        },
      },
      cookieOptions: {
        name: 'sb-session',
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
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

  const login = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Wait for session to be set
    if (data?.session) {
      setUser({ id: data.session.user.id, email: data.session.user.email || '' });
      setLoading(false);
      // Use router.push instead of refresh to ensure client-side navigation
      router.push('/expenses');
    }
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