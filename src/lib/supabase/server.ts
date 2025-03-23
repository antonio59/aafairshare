import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

export function createClient(cookieStore?: { get: (name: string) => string | undefined | Promise<string | undefined> }) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // If a cookie store is provided (e.g., from middleware), use it
          if (cookieStore) {
            return cookieStore.get(name);
          }
          // Otherwise, return null (this will be used in API routes where cookies are handled differently)
          return null;
        },
        set() {
          // Cookie setting is handled by middleware or browser client
        },
        remove() {
          // Cookie removal is handled by middleware or browser client
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
}