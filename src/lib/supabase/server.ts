import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

export function createClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() {
          return null;
        },
        set() {
          // Cookie setting is handled by middleware
        },
        remove() {
          // Cookie removal is handled by middleware
        },
      },
    }
  );
} 