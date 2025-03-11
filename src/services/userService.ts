import { supabase } from '../lib/supabase';
import { createLogger } from '../utils/logger';
import { User, UserResponse, AdminUserAttributes } from '@supabase/supabase-js';

// Create a logger for this module
const logger = createLogger('UserService');

interface UserPreferences {
  currency: string;
  notifications?: boolean;
  theme?: 'light' | 'dark';
  [key: string]: unknown;
}

interface UserData {
  id: string;
  name?: string;
  email: string;
  preferences: UserPreferences;
  language: string;
  updated_at: string;
  [key: string]: unknown;
}

// Function to get user data
export const getUserData = async (userId: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error fetching user data', error);
    throw error;
  }
};

// Function to create a new user
export const createUser = async (
  email: string,
  password: string
): Promise<UserResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error creating user', error);
    throw error;
  }
};

// Function to update user
export const updateUser = async (
  userId: string,
  updates: AdminUserAttributes
): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, updates);
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error updating user', error);
    throw error;
  }
};

// Function to delete user
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    return true;
  } catch (error) {
    logger.error('Error deleting user', error);
    throw error;
  }
};

// Function to get all users
export const getUsers = async (): Promise<UserData[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    // Format the data to maintain compatibility with existing code
    const formattedData = data.map(user => ({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      preferences: user.preferences || { currency: 'GBP' },
      language: user.language || 'en',
      updated_at: user.updated_at
    }));
    
    logger.info('Users fetched successfully', { count: formattedData.length });
    return formattedData;
  } catch (error) {
    logger.error('Error fetching users', error);
    throw error;
  }
}; 