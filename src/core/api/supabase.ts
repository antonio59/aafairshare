import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'present' : 'missing',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error(
    'Supabase configuration is missing. Please ensure VITE_SUPABASE_URL and ' +
    'VITE_SUPABASE_ANON_KEY are properly set in your environment variables.'
  );
}

// Validate URL format
if (!supabaseUrl.startsWith('http')) {
  throw new Error('Invalid VITE_SUPABASE_URL format. URL must start with http:// or https://');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export type SupabaseClient = typeof supabase;