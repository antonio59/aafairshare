import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.types';
import { createLogger } from '../utils/logger';

const logger = createLogger('SupabaseClient');

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  logger.error('Missing required environment variables:', { missingVars });
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Create and export the main Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  global: {
    headers: {
      'x-client-info': 'aafairshare@1.0.0'
    }
  }
});

// Add event listeners for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  logger.debug('Auth state changed:', { event, hasSession: !!session });
});

// Export types
export type SupabaseClient = typeof supabase;

// Helper function to check connection status
export async function checkSupabaseConnection(): Promise<{ success: boolean; message: string; error?: any }> {
  try {
    const { error } = await supabase.from('users').select('count').limit(1).single();
    if (error) throw error;
    return { success: true, message: 'Successfully connected to Supabase' };
  } catch (error) {
    logger.error('Error checking Supabase connection:', error);
    return { 
      success: false, 
      message: 'Failed to connect to Supabase', 
      error 
    };
  }
}

// Export helper function for direct authentication
export async function directSignIn(email: string, password: string) {
  try {
    logger.info('Attempting direct sign-in');
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  } catch (error) {
    logger.error('Direct sign-in error:', error);
    throw error;
  }
}

// Export helper function for direct sign-up
export async function directSignUp(email: string, password: string, userData: object) {
  try {
    logger.info('Attempting direct sign-up');
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
  } catch (error) {
    logger.error('Direct sign-up error:', error);
    throw error;
  }
}