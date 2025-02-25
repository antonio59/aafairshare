import { createClient, SupabaseClient } from '@supabase/supabase-js'

declare global {
  interface Window {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    };
  }
}

// Get environment variables from window.env (injected in _document.tsx)
const supabaseUrl = typeof window !== 'undefined' 
  ? window.env?.NEXT_PUBLIC_SUPABASE_URL 
  : process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = typeof window !== 'undefined'
  ? window.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})