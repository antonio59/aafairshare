import { supabase } from '../api/supabase';
import { createLogger } from './logger';

const logger = createLogger('ConnectionUtils');

interface ConnectionStatus {
  success: boolean;
  error?: string;
}

/**
 * Checks if the Supabase connection is working by attempting a simple query
 * @returns Promise<ConnectionStatus>
 */
export async function checkSupabaseConnection(): Promise<ConnectionStatus> {
  try {
    // Attempt to get the current session as a lightweight connection test
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      logger.error('Connection check failed:', error);
      return {
        success: false,
        error: 'Failed to connect to authentication service'
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Connection check exception:', error);
    return {
      success: false,
      error: 'Unable to reach authentication service'
    };
  }
}