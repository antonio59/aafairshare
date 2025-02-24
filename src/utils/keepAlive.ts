import { supabase } from '../supabase';

/**
 * Sends a simple query to keep the Supabase database active
 * This prevents the free tier database from being paused due to inactivity
 */
export async function pingDatabase(): Promise<void> {
  try {
    const { error } = await supabase
      .from('_heartbeat')
      .insert([{ timestamp: new Date().toISOString() }]);

    if (error) {
      console.error('Failed to ping database:', error.message);
      throw error;
    }

    console.log('Successfully pinged database at:', new Date().toISOString());
  } catch (error) {
    console.error('Error in pingDatabase:', error);
    throw error;
  }
}
