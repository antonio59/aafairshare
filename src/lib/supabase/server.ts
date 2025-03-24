import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, type NextResponse } from 'next/server';

import type { Database } from '@/lib/supabase/types';
import type { CookieOptions } from '@supabase/ssr';

export const runtime = 'edge';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Original function for middleware usage
export async function createClient(request?: NextRequest, response?: NextResponse) {
  // If request and response are provided, use them (for middleware)
  if (request && response) {
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );
  }
  
  // For server components - using the cookies() API
  // Make sure to await cookies() to fix the sync API error
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Use the awaited cookieStore
          return cookieStore.get(name)?.value;
        },
        set() {
          // Can't set cookies in server components
        },
        remove() {
          // Can't remove cookies in server components
        },
      },
    }
  );
}