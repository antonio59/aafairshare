import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

export function createClient() {
  const cookieMethods = {
    get(name: string) {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`))
        ?.split('=')[1];
    },
    set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string }) {
      const path = options.path || '/';
      const domain = options.domain ? `; domain=${options.domain}` : '';
      document.cookie = `${name}=${value}; path=${path}${domain}; max-age=${options.maxAge || 7 * 24 * 60 * 60}; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`;
    },
    remove(name: string, options: { path?: string; domain?: string }) {
      const path = options.path || '/';
      const domain = options.domain ? `; domain=${options.domain}` : '';
      document.cookie = `${name}=; path=${path}${domain}; max-age=0; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`;
    }
  };

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieMethods,
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
}