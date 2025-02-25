import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
if (!SUPABASE_ANON_KEY) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');

interface CookieHandler {
  get(name: string): string | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  remove(name: string, options: CookieOptions): void;
}

function createCookieHandler(): CookieHandler {
  const cookieStore = cookies();

  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value, ...options });
      } catch (error) {
        console.error('Error setting cookie:', error);
      }
    },
    remove(name: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value: '', ...options });
      } catch (error) {
        console.error('Error removing cookie:', error);
      }
    },
  };
}

export function createClient() {
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: createCookieHandler()
    }
  );
}
