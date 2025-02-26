import { createClient, SupabaseClient } from '@supabase/supabase-js'

declare global {
  interface Window {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    };
  }
}

// Default Supabase credentials - these will be used if environment variables are not available
const DEFAULT_SUPABASE_URL = 'https://ilrnhmnkstnglkrsirjq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm5obW5rc3RuZ2xrcnNpcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzNzc2MjQsImV4cCI6MjA0Nzk1MzYyNH0.bG4rbyHXEmW38Vb1eT6BBgXiPmtDzgf4FHIImqqJY8c';

// Get environment variables from window.env (injected in _document.tsx) or directly from process.env
function getSupabaseUrl(): string {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Try to get URL from window.env
    if (window.env && window.env.NEXT_PUBLIC_SUPABASE_URL) {
      return window.env.NEXT_PUBLIC_SUPABASE_URL;
    }
    
    // Try to get URL from process.env in the browser
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return process.env.NEXT_PUBLIC_SUPABASE_URL;
    }
  } else {
    // Server-side: try to get URL from process.env
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return process.env.NEXT_PUBLIC_SUPABASE_URL;
    }
  }
  
  // Fallback to default URL
  return DEFAULT_SUPABASE_URL;
}

function getSupabaseAnonKey(): string {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Try to get key from window.env
    if (window.env && window.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return window.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
    
    // Try to get key from process.env in the browser
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
  } else {
    // Server-side: try to get key from process.env
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
  }
  
  // Fallback to default key
  return DEFAULT_SUPABASE_ANON_KEY;
}

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Log warning if using default values
if (supabaseUrl === DEFAULT_SUPABASE_URL || supabaseAnonKey === DEFAULT_SUPABASE_ANON_KEY) {
  console.warn('Using default Supabase credentials. This is fine for development but should be configured properly in production.');
}

// Validate URL before creating client
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error(`Invalid Supabase URL: ${url}`);
    return false;
  }
}

// Create Supabase client with validated URL
export const supabase: SupabaseClient = createClient(
  isValidUrl(supabaseUrl) ? supabaseUrl : DEFAULT_SUPABASE_URL,
  supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);