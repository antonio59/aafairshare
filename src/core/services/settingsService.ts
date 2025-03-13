import { supabase } from '../api/supabase';
import { createLogger } from '../utils/logger';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

const logger = createLogger('settingsService');

interface UserSettings {
  id: string;
  user_id: string;
  currency: string;
  theme: 'light' | 'dark';
  created_at?: string;
  updated_at?: string;
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const response: PostgrestSingleResponse<UserSettings> = await supabase
      .from('user_settings')
      .select('id, user_id, currency, theme, created_at, updated_at')
      .eq('user_id', userId)
      .single();

    if (response.error) throw response.error;
    return response.data;
  } catch (error) {
    logger.error('Error fetching user settings:', error);
    return null;
  }
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    logger.error('Error updating user settings:', error);
    return false;
  }
}

export async function initializeUserSettings(userId: string): Promise<boolean> {
  try {
    const defaultSettings: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      currency: 'GBP',
      theme: 'light'
    };

    const { error } = await supabase
      .from('user_settings')
      .insert([defaultSettings]);

    if (error) throw error;
    return true;
  } catch (error) {
    logger.error('Error initializing user settings:', error);
    return false;
  }
}

export async function getGlobalSettings(): Promise<Record<string, any> | null> {
  try {
    const { data, error } = await supabase
      .from('global_settings')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error fetching global settings:', error);
    return null;
  }
} 