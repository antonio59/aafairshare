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
  let url = '';
  
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Try to get URL from window.env
    if (window.env && window.env.NEXT_PUBLIC_SUPABASE_URL) {
      url = window.env.NEXT_PUBLIC_SUPABASE_URL;
      console.log('Using Supabase URL from window.env:', url);
    } else {
      // Try to get URL from process.env in the browser
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        console.log('Using Supabase URL from process.env in browser:', url);
      } else {
        console.warn('No Supabase URL found in window.env or process.env in browser');
      }
    }
  } else {
    // Server-side: try to get URL from process.env
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      console.log('Using Supabase URL from process.env on server:', url);
    } else {
      console.warn('No Supabase URL found in process.env on server');
    }
  }
  
  // Fallback to default URL if no URL was found
  if (!url) {
    url = DEFAULT_SUPABASE_URL;
    console.warn('Using default Supabase URL:', url);
  }
  
  // Ensure URL has a protocol
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
    console.log('Added https:// protocol to URL:', url);
  }
  
  return url;
}

function getSupabaseAnonKey(): string {
  let key = '';
  
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Try to get key from window.env
    if (window.env && window.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      key = window.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      console.log('Using Supabase key from window.env');
    } else {
      // Try to get key from process.env in the browser
      if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        console.log('Using Supabase key from process.env in browser');
      } else {
        console.warn('No Supabase key found in window.env or process.env in browser');
      }
    }
  } else {
    // Server-side: try to get key from process.env
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      console.log('Using Supabase key from process.env on server');
    } else {
      console.warn('No Supabase key found in process.env on server');
    }
  }
  
  // Fallback to default key if no key was found
  if (!key) {
    key = DEFAULT_SUPABASE_ANON_KEY;
    console.warn('Using default Supabase key');
  }
  
  return key;
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
    console.log('URL is valid:', url);
    return true;
  } catch (e) {
    console.error(`Invalid Supabase URL: ${url}`, e);
    return false;
  }
}

// Get final URL to use
const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : DEFAULT_SUPABASE_URL;
console.log('Final Supabase URL being used:', finalUrl);

// Create Supabase client with validated URL
export const supabase: SupabaseClient = createClient(
  finalUrl,
  supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);