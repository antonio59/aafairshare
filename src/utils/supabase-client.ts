'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { CookieOptions } from '@supabase/ssr';

/**
 * Creates a standardized Supabase browser client with proper cookie handling
 * This ensures consistent configuration across all client components
 */
export function createStandardBrowserClient() {
  const cookieMethods = {
    get(name: string) {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`))
        ?.split('=')[1];
    },
    set(name: string, value: string, options: { path?: string; maxAge?: number }) {
      document.cookie = `${name}=${value}; path=${options.path || '/'}; max-age=${options.maxAge || 3600}`;
    },
    remove(name: string, options: { path?: string }) {
      document.cookie = `${name}=; path=${options.path || '/'}; max-age=0`;
    }
  };

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieMethods
    }
  );
}
