'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

// Default Supabase credentials - these will be used if environment variables are not available
const DEFAULT_SUPABASE_URL = 'https://ilrnhmnkstnglkrsirjq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm5obW5rc3RuZ2xrcnNpcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc1ODY5MzYsImV4cCI6MjAxMzE2MjkzNn0.G5QVdh9fKrEZq8bBmw0a1CGXkdQP66_Yyx9btYhWL9U';

// Single instance of the Supabase client
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Function to get Supabase URL with proper validation
 */
function getSupabaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  
  // Ensure URL has a protocol
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  // Validate URL format (only in client where URL class is available)
  if (typeof window !== 'undefined') {
    try {
      new URL(url);
    } catch (error) {
      console.error('Client: Invalid Supabase URL format:', url);
      // Fall back to default if URL is invalid
      url = DEFAULT_SUPABASE_URL;
    }
  }
  
  return url;
}

/**
 * Function to get Supabase anonymous key
 */
function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
}

/**
 * Creates a Supabase client for use in browser context
 */
export function createClientSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('createClientSupabaseClient should only be used in client components');
  }
  
  if (clientInstance) return clientInstance;
  
  clientInstance = createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  );
  
  return clientInstance;
}

/**
 * Returns the current instance or creates a new one
 */
export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClientSupabaseClient();
  }
  return clientInstance;
}

/**
 * Legacy function to maintain compatibility with existing code
 */
export const supabaseClient = {
  get instance() {
    return getSupabaseClient();
  }
};
