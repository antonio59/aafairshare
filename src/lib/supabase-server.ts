import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';

// Default Supabase credentials - these will be used if environment variables are not available
const DEFAULT_SUPABASE_URL = 'https://ilrnhmnkstnglkrsirjq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm5obW5rc3RuZ2xrcnNpcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc1ODY5MzYsImV4cCI6MjAxMzE2MjkzNn0.G5QVdh9fKrEZq8bBmw0a1CGXkdQP66_Yyx9btYhWL9U';

// Safe environment variable getters
function getSupabaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  
  // Ensure URL has a protocol
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    console.error('Server: Invalid Supabase URL format:', url);
    // Fall back to default if URL is invalid
    url = DEFAULT_SUPABASE_URL;
  }
  
  return url;
}

function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
}

/**
 * Creates a Supabase client using server components
 * @returns SupabaseClient with auth session from cookies
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path: string; maxAge: number; domain?: string; sameSite?: 'lax' | 'strict' | 'none'; secure?: boolean }) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: { path: string; domain?: string }) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}

/**
 * Legacy function to maintain compatibility with existing code
 */
export async function getServerSession() {
  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

/**
 * Returns the user from a server component
 */
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user || null;
}

/**
 * Get a database-only client for server operations
 * This client doesn't handle auth or cookies
 */
export function createServerSupabaseDatabaseClient() {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      auth: { persistSession: false },
    }
  );
}

/**
 * Legacy function to maintain compatibility with existing code
 */
export function createClient() {
  return createServerSupabaseClient();
}
