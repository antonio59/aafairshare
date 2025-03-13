import { supabase } from '../core/api/supabase';
import { createLogger } from '../utils/logger';
import { Json } from '../core/types/supabase.types';

// Create a logger for this module
const logger = createLogger('SettingsService');

// Simple user data type without preferences
interface UserData {
  id: string;
  email: string;
  name: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * Updates user basic info
 * @param userId - The user ID
 * @param data - The data to update (name, email)
 * @returns Updated user data or null
 */
export async function updateUserInfo(
  userId: string,
  data: { name?: string; email?: string }
): Promise<UserData | null> {
  if (!userId) {
    logger.error('updateUserInfo called without userId');
    throw new Error('User ID is required');
  }

  if (!data || typeof data !== 'object') {
    logger.error('updateUserInfo called with invalid data', { data });
    throw new Error('Valid data object is required');
  }

  try {
    const { data: updatedData, error } = await supabase
      .from('users')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error(`Database error updating user info for ${userId}`, error);
      throw new Error('Failed to update user info');
    }

    logger.info('User info updated', { userId });
    return updatedData as UserData;
  } catch (error) {
    logger.error('Error updating user info', error);
    throw error;
  }
} 