import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.types';
import { createLogger } from '../utils/logger';

const logger = createLogger('SupabaseClient');

// Use hardcoded credentials for consistency
const supabaseUrl = 'https://ccwcbnfnvkmwubkuvzns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjd2NibmZudmttd3Via3V2em5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzI0MDcsImV4cCI6MjA1NjcwODQwN30.tgbRreo_VKimkIcs9FvV6Vy1nUaAmLwd8ptwHXmI8GI';

// Create a custom fetch with explicit CORS handling
const customFetch = (input: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  // Convert input to string if needed
  const url = typeof input === 'string' ? input : input.toString();
  
  // Log request details for debugging
  logger.debug('Supabase API Request:', {
    url,
    method: options?.method || 'GET',
    hasAuth: options?.headers && ('Authorization' in options.headers || 'apikey' in options.headers)
  });

  // Add explicit CORS handling
  const headers = {
    ...(options?.headers || {}),
    'apikey': supabaseKey,
    'Content-Type': 'application/json',
    'Origin': window.location.origin
  };

  const fetchOptions = {
    ...options,
    headers,
    mode: 'cors' as RequestMode,
    signal: options?.signal,
    credentials: 'same-origin' as RequestCredentials // Use same-origin for consistency
  };

  return new Promise<Response>((resolve, reject) => {
    // Add a timeout for the fetch request
    const timeoutId = setTimeout(() => {
      logger.error('Supabase API Request Timeout:', { url });
      reject(new Error('Request timeout'));
    }, 15000); // 15 second timeout
    
    fetch(input, fetchOptions)
      .then(response => {
        clearTimeout(timeoutId);
        
        // Log response details
        logger.debug('Supabase API Response:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          url: response.url
        });
        
        if (!response.ok) {
          logger.error('Supabase API Error:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url
          });
        }
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        logger.error('Supabase API Request Failed:', error);
        
        // Network errors should be more informative
        const enhancedError = new Error(`Fetch error: ${error.message}`);
        enhancedError.name = 'EnhancedFetchError';
        reject(enhancedError);
      });
  });
};

// Create and export the main Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    storageKey: 'supabase.auth.token',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  global: {
    headers: {
      'x-client-info': 'aafairshare@1.0.0'
    },
    fetch: customFetch
  }
});

// Export the main client as the auth client for backwards compatibility
export const authClient = supabase;

// Log session at startup to help diagnose issues
(async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    logger.info('Initial session check:', {
      hasSession: !!data.session,
      hasError: !!error,
      errorMessage: error?.message
    });
  } catch (err) {
    logger.error('Error checking initial session:', err);
  }
})();

// Add event listeners for auth state changes
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    logger.debug('Auth state changed:', { event, hasSession: !!session });
  });
}

// Export types
export type SupabaseClient = typeof supabase;

// Export helper function to check connection
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('settings').select('*').limit(1);
    return !error;
  } catch (error) {
    logger.error('Error checking Supabase connection:', error);
    return false;
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