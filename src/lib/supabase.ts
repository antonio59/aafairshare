import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
if (!SUPABASE_ANON_KEY) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');

type CookieHandler = {
  get(name: string): string | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  remove(name: string, options: CookieOptions): void;
};

async function createCookieHandler(): Promise<CookieHandler> {
  const cookieStore = cookies();

  return {
    async get(name: string): Promise<string | undefined> {
      const cookie = cookieStore.get(name);
      return cookie?.value;
    },
    async set(name: string, value: string, options: CookieOptions): Promise<void> {
      try {
        cookieStore.set({ name, value, ...options });
      } catch (error) {
        console.error('Error setting cookie:', error);
      }
    },
    async remove(name: string, options: CookieOptions): Promise<void> {
      try {
        cookieStore.set({ name, value: '', ...options });
      } catch (error) {
        console.error('Error removing cookie:', error);
      }
    },
  };
}

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: createCookieHandler()
    }
  );
}
