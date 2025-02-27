'use client';

import { getSupabaseClient } from '@/lib/supabase-client';

// Export the client for browser usage with different names for compatibility
export const supabase = getSupabaseClient();
export const supabaseClient = supabase; // Alias for consistency

// Also provide a function to get the supabase client for compatibility
export function getSupabase() {
  return getSupabaseClient();
}

// Default export for legacy imports
export default supabase;