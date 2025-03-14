import { createClient } from '@supabase/supabase-js';
import type { Database } from './core/types/supabase.types';

/**
 * Creates a fresh Supabase client with special handling for the API key
 * This is useful when the default client isn't working correctly
 */
export function createFreshClient() {
  // Get environment variables directly
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  let supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Ensure we have the URL and key
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or API key');
    throw new Error('Missing Supabase URL or API key');
  }

  // Clean the key - remove any whitespace, newlines, or other unwanted characters
  supabaseKey = supabaseKey.replace(/\s+/g, '');
  
  // Log configuration without exposing the full key
  console.log('Creating fresh Supabase client:', {
    url: supabaseUrl,
    keyLength: supabaseKey.length,
    keyStart: `${supabaseKey.substring(0, 10)}...`
  });

  // Create a simple client with minimal configuration
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });
} 