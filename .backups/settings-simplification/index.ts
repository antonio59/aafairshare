import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { Json } from '../supabase.types';

/**
 * Interface representing a Supabase user with additional type safety
 */
export type SupabaseUser = User;

/**
 * Interface representing a user's profile from the database
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Interface for auth responses
 */
export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: SupabaseUser;
}

/**
 * Interface for auth context
 */
export interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, name: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ success: boolean }>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
  clearError: () => void;
  refreshSession: () => Promise<boolean>;
  resetAuthState: () => Promise<boolean>;
  updateProfile?: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
}

/**
 * Interface for user settings that can be updated
 */
export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  display?: {
    compactView?: boolean;
    dashboardLayout?: string;
  };
  [key: string]: any;
}

/**
 * Interface for user update operations
 */
export interface UserUpdate {
  name?: string;
  email?: string;
}

/**
 * Interface for API responses involving users
 */
export interface UserApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
  success: boolean;
  message?: string;
}

/**
 * Type for user roles
 */
export type UserRole = 'admin' | 'user' | 'editor';

/**
 * Interface for authentication state
 */
export interface AuthState {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Interface for password change request
 */
export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Type for auth events
 */
export type AuthEvent = AuthChangeEvent; 