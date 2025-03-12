import { supabase } from '../core/api/supabase';
import { createLogger } from '../core/utils/logger';
import { PostgrestResponse, UserResponse } from '@supabase/supabase-js';

const logger = createLogger('api-fetcher');

interface FetchOptions {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetrySession?: boolean;
}

/**
 * A wrapper around Supabase queries that adds retry capability and session refresh
 * to handle token expiration issues.
 * @template T The type of successful response data
 * @template R The return type of the query function (usually a Promise)
 */
export async function fetchWithRetry<T, R extends { data: T | null; error: any }>(
  queryFn: () => Promise<R>,
  options: FetchOptions = {}
): Promise<R> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    shouldRetrySession = true
  } = options;
  
  let retries = 0;
  let lastError: any = null;

  while (retries <= maxRetries) {
    try {
      const result = await queryFn();
      
      // If successful, return the result
      if (!result.error) {
        return result;
      }
      
      // Handle auth errors by refreshing the session
      if (shouldRetrySession && 
         (result.error.status === 401 || 
          result.error.code === 'PGRST301' || 
          result.error.message?.includes('JWT expired'))) {
        
        logger.warn('Auth error detected, refreshing session before retry', result.error);
        
        // Try to refresh the session
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error || !data.session) {
          logger.error('Session refresh failed', error);
          // Break out of the retry loop if we can't refresh the session
          return result;
        }
        
        logger.info('Session refreshed successfully, retrying request');
      } else if (result.error) {
        // For non-auth errors, just log and retry
        logger.warn(`Request failed (attempt ${retries + 1}/${maxRetries + 1})`, result.error);
      }
      
      lastError = result.error;
      
    } catch (error) {
      logger.error(`Unexpected error in request (attempt ${retries + 1}/${maxRetries + 1})`, error);
      lastError = error;
    }
    
    // Increase retry count and wait before the next attempt
    retries++;
    
    if (retries <= maxRetries) {
      // Use exponential backoff
      const delay = retryDelay * Math.pow(2, retries - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we get here, all retries failed
  logger.error('All retry attempts failed', lastError);
  
  // Since we can't actually create a proper R with the correct types,
  // we return an object that matches the structure as best as possible
  return { data: null, error: lastError } as R;
}

/**
 * Helper function specifically for user authentication queries
 */
export async function fetchAuthWithRetry<T>(
  queryFn: () => Promise<UserResponse>,
  options: FetchOptions = {}
): Promise<{ data: { user: T | null }; error: any }> {
  const response = await fetchWithRetry(queryFn, options);
  return {
    data: { user: response.data?.user as T || null },
    error: response.error
  };
}

/**
 * Helper function specifically for PostgrestResponse queries
 */
export async function fetchDataWithRetry<T>(
  queryFn: () => Promise<PostgrestResponse<T>>,
  options: FetchOptions = {}
): Promise<PostgrestResponse<T>> {
  return await fetchWithRetry(queryFn, options);
}

/**
 * Example usage:
 * 
 * // Instead of:
 * const { data, error } = await supabase.from('expenses').select('*');
 * 
 * // Use:
 * const { data, error } = await fetchDataWithRetry(() => 
 *   supabase.from('expenses').select('*')
 * );
 */ 