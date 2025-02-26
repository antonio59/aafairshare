import { createClient, SupabaseClient } from '@supabase/supabase-js'

declare global {
  interface Window {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    };
  }
}

// Get environment variables from window.env (injected in _document.tsx) or directly from process.env
const supabaseUrl = typeof window !== 'undefined' && window.env 
  ? window.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  : process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const supabaseAnonKey = typeof window !== 'undefined' && window.env
  ? window.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://ilrnhmnkstnglkrsirjq.supabase.co', 
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm5obW5rc3RuZ2xrcnNpcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzNzc2MjQsImV4cCI6MjA0Nzk1MzYyNH0.bG4rbyHXEmW38Vb1eT6BBgXiPmtDzgf4FHIImqqJY8c',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);