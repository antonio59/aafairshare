import { createClient as createClientOriginal } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Default Supabase credentials - these will be used if environment variables are not available
const DEFAULT_SUPABASE_URL = 'https://ilrnhmnkstnglkrsirjq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm5obW5rc3RuZ2xrcnNpcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzNzc2MjQsImV4cCI6MjA0Nzk1MzYyNH0.bG4rbyHXEmW38Vb1eT6BBgXiPmtDzgf4FHIImqqJY8c';

// Function to get Supabase URL with proper validation
function getSupabaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  
  // Ensure URL has a protocol
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
    console.log('API: Added https:// protocol to URL:', url);
  }
  
  // Log whether we're using default or environment variable
  if (url === DEFAULT_SUPABASE_URL) {
    console.log('API: Using DEFAULT Supabase URL');
  } else {
    console.log('API: Using environment variable for Supabase URL');
  }
  
  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    console.error('API: Invalid Supabase URL format:', url);
    // Fall back to default if URL is invalid
    url = DEFAULT_SUPABASE_URL;
    console.log('API: Falling back to DEFAULT Supabase URL');
  }
  
  return url;
}

// Function to get Supabase anonymous key
function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  
  // Log whether we're using default or environment variable
  if (key === DEFAULT_SUPABASE_ANON_KEY) {
    console.log('API: Using DEFAULT Supabase Anon Key');
  } else {
    console.log('API: Using environment variable for Supabase Anon Key');
  }
  
  return key;
}

// Create a Supabase client for API routes
export const createClient = () => {
  try {
    const cookieStore = cookies();
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();
    
    console.log('API: Creating Supabase client with URL:', supabaseUrl);
    
    return createClientOriginal(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: true,
        },
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Server component doesn't need to set cookies
          },
          remove(name: string, options: any) {
            // Server component doesn't need to remove cookies
          },
        },
      }
    );
  } catch (error) {
    console.error('API: Failed to create Supabase client:', error);
    // Create with default values as fallback
    return createClientOriginal(
      DEFAULT_SUPABASE_URL,
      DEFAULT_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: true,
        }
      }
    );
  }
};

// Create a client for the browser
export const createBrowserClient = () => {
  try {
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();
    
    console.log('Browser: Creating Supabase client with URL:', supabaseUrl);
    
    return createClientOriginal(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    );
  } catch (error) {
    console.error('Browser: Failed to create Supabase client:', error);
    // Create with default values as fallback
    return createClientOriginal(
      DEFAULT_SUPABASE_URL,
      DEFAULT_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    );
  }
};
