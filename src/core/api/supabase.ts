import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('DEBUG: Supabase environment variables:', {
  supabaseUrl,
  supabaseAnonKey,
  urlType: typeof supabaseUrl,
  keyType: typeof supabaseAnonKey,
  urlLength: supabaseUrl?.length,
  keyLength: supabaseAnonKey?.length
});

// More explicit check to handle edge cases like undefined, empty strings, etc.
if (typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '' || 
    typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '') {
  console.error('Missing or invalid Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export type SupabaseClient = typeof supabase; 