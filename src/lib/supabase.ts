import { createClient as createClientOriginal } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Fallback values in case environment variables are not set
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const createClient = () => {
  const cookieStore = cookies();
  
  return createClientOriginal(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
};

// Create a client for the browser
export const createBrowserClient = () => {
  return createClientOriginal(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
};
