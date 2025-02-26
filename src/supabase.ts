import { createClient as createClientLib, createBrowserClient as createBrowserClientLib } from './lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// Re-export the client creation functions from lib/supabase.ts
export const createClient = createClientLib;
export const createBrowserClient = createBrowserClientLib;

// Create a singleton instance for client-side use
let supabase: SupabaseClient;

// Initialize the Supabase client
export const initSupabase = () => {
  if (supabase) {
    console.log('Supabase client already initialized');
    return supabase;
  }
  
  try {
    console.log('Initializing Supabase client');
    supabase = createBrowserClientLib();
    return supabase;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    throw error;
  }
};

// Get the initialized Supabase client
export const getSupabase = () => {
  if (!supabase) {
    return initSupabase();
  }
  return supabase;
};

// Export the singleton instance
export { supabase };

// Initialize on import
initSupabase();