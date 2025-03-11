import { supabase } from '../lib/supabase';
import { createLogger } from '../utils/logger';

// Create a logger for this module
const logger = createLogger('SettingsService');

interface GlobalSettings {
  app_currencies: string[];
  default_currency: string;
  default_language: string;
  [key: string]: unknown;
}

interface UserPreferences {
  currency: string;
  notifications?: boolean;
  theme?: 'light' | 'dark';
  [key: string]: unknown;
}

interface UserSettings {
  preferences: UserPreferences;
  language: string;
}

interface UserData {
  id: string;
  email: string;
  preferences: UserPreferences;
  language: string;
  updated_at: string;
  [key: string]: unknown;
}

interface SettingRecord {
  key: string;
  value: unknown;
}

// Default settings if none exist in the database
const DEFAULT_SETTINGS: GlobalSettings = {
  app_currencies: ['GBP', 'USD', 'EUR'],
  default_currency: 'GBP',
  default_language: 'en'
};

/**
 * Validates user preferences structure
 * @param preferences - The preferences to validate
 * @returns Validated preferences object
 */
const validatePreferences = (preferences: unknown): UserPreferences => {
  if (!preferences || typeof preferences !== 'object') {
    return { currency: DEFAULT_SETTINGS.default_currency };
  }
  
  const prefs = preferences as UserPreferences;
  
  // Ensure currency is valid
  if (!prefs.currency || typeof prefs.currency !== 'string' || 
      !DEFAULT_SETTINGS.app_currencies.includes(prefs.currency)) {
    return { ...prefs, currency: DEFAULT_SETTINGS.default_currency };
  }
  
  return prefs;
};

/**
 * Fetches global settings from the database
 * @returns Global settings
 */
export async function getGlobalSettings(): Promise<GlobalSettings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*');

    if (error) {
      logger.error('Database error fetching global settings', error);
      throw new Error('Failed to fetch global settings');
    }

    // Transform array of settings into an object
    const settings: Partial<GlobalSettings> = {};
    (data as SettingRecord[])?.forEach(item => {
      try {
        settings[item.key as keyof GlobalSettings] = item.value;
      } catch (parseError) {
        logger.error(`Error parsing setting value for key ${item.key}`, parseError);
      }
    });

    // Merge with defaults for any missing settings
    const mergedSettings: GlobalSettings = {
      ...DEFAULT_SETTINGS,
      ...settings
    };
    
    logger.info('Global settings retrieved', { settingsCount: Object.keys(mergedSettings).length });
    return mergedSettings;
  } catch (error) {
    logger.error('Error fetching global settings', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Fetches user-specific settings
 * @param userId - The user ID
 * @returns User settings or null
 */
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  if (!userId) {
    logger.error('getUserSettings called without userId');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('preferences, language')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error(`Database error fetching user settings for ${userId}`, error);
      throw new Error('Failed to fetch user settings');
    }

    // Ensure we have valid preferences
    const validatedPreferences = validatePreferences(data?.preferences);
    
    const userSettings: UserSettings = {
      preferences: validatedPreferences,
      language: data?.language || 'en'
    };
    
    logger.info('User settings retrieved', { userId });
    return userSettings;
  } catch (error) {
    logger.error('Error fetching user settings', error);
    // Return default settings instead of failing completely
    return {
      preferences: { currency: DEFAULT_SETTINGS.default_currency },
      language: 'en'
    };
  }
}

/**
 * Updates user settings
 * @param userId - The user ID
 * @param settings - The settings to update
 * @returns Updated user data or null
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserData | null> {
  if (!userId) {
    logger.error('updateUserSettings called without userId');
    throw new Error('User ID is required');
  }

  if (!settings || typeof settings !== 'object') {
    logger.error('updateUserSettings called with invalid settings', { settings });
    throw new Error('Valid settings object is required');
  }

  try {
    // Validate preferences before updating
    const validatedPreferences = validatePreferences(settings.preferences);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        preferences: validatedPreferences,
        language: settings.language || 'en',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error(`Database error updating user settings for ${userId}`, error);
      throw new Error('Failed to update user settings');
    }

    logger.info('User settings updated', { 
      userId,
      currency: validatedPreferences.currency,
      language: settings.language
    });
    return data as UserData;
  } catch (error) {
    logger.error('Error updating user settings', error);
    throw error;
  }
}

/**
 * Initializes settings for a new user
 * @param userId - The user ID
 * @param email - The user's email
 * @returns Initialized user data or null
 */
export async function initializeUserSettings(
  userId: string, _email: string
): Promise<UserData | null> {
  if (!userId) {
    console.log('DEBUG: initializeUserSettings called without userId');
    logger.error('initializeUserSettings called without userId');
    throw new Error('User ID is required');
  }

  try {
    console.log('DEBUG: initializeUserSettings called for userId:', userId);
    // Get global settings
    console.log('DEBUG: Getting global settings');
    const globalSettings = await getGlobalSettings();
    console.log('DEBUG: Global settings retrieved:', globalSettings);

    // Create user settings with defaults
    console.log('DEBUG: Updating user with default settings');
    const { data, error } = await supabase
      .from('users')
      .update({
        preferences: {
          currency: globalSettings.default_currency,
          notifications: true,
          theme: 'light'
        },
        language: globalSettings.default_language,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    console.log('DEBUG: Update result:', { data, error });

    if (error) {
      console.log('DEBUG: Error initializing user settings:', error);
      logger.error(`Database error initializing user settings for ${userId}`, error);
      throw new Error('Failed to initialize user settings');
    }

    logger.info('User settings initialized', { 
      userId,
      currency: globalSettings.default_currency,
      language: globalSettings.default_language
    });
    console.log('DEBUG: Returning initialized user settings:', data);
    return data as UserData;
  } catch (error) {
    console.log('DEBUG: Caught error in initializeUserSettings:', error);
    logger.error('Error initializing user settings', error);
    throw error;
  }
} 