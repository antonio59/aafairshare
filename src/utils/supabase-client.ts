'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/supabase';

/**
 * Creates a standardized Supabase browser client with proper cookie handling
 * This ensures consistent configuration across all client components
 */
export function createStandardBrowserClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    throw new Error('Application configuration error');
  }

  try {
    const cookieMethods = {
      get(name: string) {
        // Safer cookie parsing
        try {
          return document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1];
        } catch (e) {
          console.error('Error reading cookie:', e);
          return undefined;
        }
      },
      set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string }) {
        try {
          const path = options.path || '/';
          const domain = options.domain ? `; domain=${options.domain}` : '';
          const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
          document.cookie = `${name}=${value}; path=${path}${domain}; max-age=${options.maxAge || 7 * 24 * 60 * 60}; SameSite=Lax${secure}`;
        } catch (e) {
          console.error('Error setting cookie:', e);
        }
      },
      remove(name: string, options: { path?: string; domain?: string }) {
        try {
          const path = options.path || '/';
          const domain = options.domain ? `; domain=${options.domain}` : '';
          const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
          document.cookie = `${name}=; path=${path}${domain}; max-age=0; SameSite=Lax${secure}`;
        } catch (e) {
          console.error('Error removing cookie:', e);
        }
      }
    };

    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: cookieMethods,
        cookieOptions: {
          name: 'sb-session',
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: false,
          maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
        },
        auth: {
          flowType: 'pkce', // Use PKCE auth flow for better security
          detectSessionInUrl: true,
          persistSession: true
        }
      }
    );
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw new Error('Failed to initialize application');
  }
}
