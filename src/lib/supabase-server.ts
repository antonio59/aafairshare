import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Default Supabase credentials - these will be used if environment variables are not available
const DEFAULT_SUPABASE_URL = 'https://ilrnhmnkstnglkrsirjq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm5obW5rc3RuZ2xrcnNpcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzNzc2MjQsImV4cCI6MjA0Nzk1MzYyNH0.bG4rbyHXEmW38Vb1eT6BBgXiPmtDzgf4FHIImqqJY8c';

// Get environment variables with fallbacks
function getSupabaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  
  // Ensure URL has a protocol
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
    console.log('Server: Added https:// protocol to URL:', url);
  }
  
  // Log whether we're using default or environment variable
  if (url === DEFAULT_SUPABASE_URL) {
    console.log('Server: Using DEFAULT Supabase URL');
  } else {
    console.log('Server: Using environment variable for Supabase URL');
  }
  
  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    console.error('Server: Invalid Supabase URL format:', url);
    // Fall back to default if URL is invalid
    url = DEFAULT_SUPABASE_URL;
    console.log('Server: Falling back to DEFAULT Supabase URL');
  }
  
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  
  // Log whether we're using default or environment variable
  if (key === DEFAULT_SUPABASE_ANON_KEY) {
    console.log('Server: Using DEFAULT Supabase Anon Key');
  } else {
    console.log('Server: Using environment variable for Supabase Anon Key');
  }
  
  return key;
}

// Create a Supabase client for server components
export async function createServerSupabaseClient() {
  try {
    const cookieStore = await cookies();
    
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();
    
    console.log('Server: Creating Supabase client with URL:', supabaseUrl);
    
    return createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
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
    console.error('Server: Failed to create Supabase client:', error);
    throw new Error(`Failed to create Supabase client: ${error instanceof Error ? error.message : String(error)}`);
  }
}
