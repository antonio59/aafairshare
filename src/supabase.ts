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

// Function to get Supabase URL with proper validation
function getSupabaseUrl(): string {
  // First check window.env (set in layout.tsx), then process.env
  let url: string | undefined;
  
  if (typeof window !== 'undefined' && window.env?.NEXT_PUBLIC_SUPABASE_URL) {
    url = window.env.NEXT_PUBLIC_SUPABASE_URL;
    console.log('Client: Using window.env for Supabase URL');
  } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    console.log('Client: Using process.env for Supabase URL');
  } else {
    url = DEFAULT_SUPABASE_URL;
    console.log('Client: Using default Supabase credentials. This is fine for development but should be configured properly in production.');
  }

  // Ensure URL has a protocol
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
    console.log('Client: Added https:// protocol to URL:', url);
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    console.error('Client: Invalid Supabase URL format:', url);
    // Fall back to default if URL is invalid
    url = DEFAULT_SUPABASE_URL;
    console.log('Client: Falling back to DEFAULT Supabase URL');
  }

  return url;
}

// Function to get Supabase anonymous key
function getSupabaseAnonKey(): string {
  // First check window.env (set in layout.tsx), then process.env
  if (typeof window !== 'undefined' && window.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Client: Using window.env for Supabase Anon Key');
    return window.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } else if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Client: Using process.env for Supabase Anon Key');
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } else {
    console.log('Client: Using default Supabase credentials. This is fine for development but should be configured properly in production.');
    return DEFAULT_SUPABASE_ANON_KEY;
  }
}

// Create and export the Supabase client
let supabase: SupabaseClient;

try {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  
  console.log('Client: Creating Supabase client with URL:', supabaseUrl);
  
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });
} catch (error) {
  console.error('Client: Failed to create Supabase client:', error);
  // Create with default values as fallback
  supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });
  console.error('Client: Using fallback Supabase client with default credentials');
}

export { supabase };