import { create } from 'zustand';
import type { User, NotificationPreferences, UserStore, NotificationChannel } from '@/types';
import { supabase } from '@/supabase';
import { clearAuthCache, auth } from '@/utils/authUtils';
import type { AuthError } from '@supabase/supabase-js';

export const defaultNotificationPreferences: NotificationPreferences = {
  globalEnabled: true,
  overBudget: {
    enabled: true,
    threshold: 80,
    channels: ['email', 'push'] as NotificationChannel[]
  },
  settlementNotifications: {
    enabled: true,
    channels: ['email', 'push'] as NotificationChannel[]
  },
  monthlyReminder: {
    enabled: true,
    day: 1,
    channels: ['email'] as NotificationChannel[]
  }
};

interface UserState {
  users: User[];
  currentUser: User | null;
  error: string | null;
  isInitialized: boolean;
}

const defaultPreferences = {
  currency: 'GBP',
  notifications: defaultNotificationPreferences
};

const initialState: UserState = {
  users: [],
  currentUser: null,
  error: null,
  isInitialized: false
};

export const useUserStore = create<UserStore>((set, get) => ({
  ...initialState,

  setInitialized: (value: boolean) => {
    set({ isInitialized: value });
    
    // Force initialization after a timeout
    if (!value) {
      setTimeout(() => {
        const { isInitialized } = get();
        if (!isInitialized) {
          set({ isInitialized: true });
        }
      }, 5000);
    }
  },

  setCurrentUser: (user: User | null) => {
    set({ currentUser: user });
  },

  login: async (email: string, password: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (user) {
        // Fetch additional user data from your profiles table if needed
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const userData: User = {
          id: user.id,
          email: user.email!,
          name: user.email!.split('@')[0] || '',
          role: (user.email!.toLowerCase() === 'andypamo@gmail.com' ? 'partner1' : 'partner2') as 'partner1' | 'partner2',
          preferences: {
            ...defaultPreferences,
            notifications: {
              ...defaultNotificationPreferences,
              ...(profile?.notification_preferences || {})
            }
          }
        };

        set({ currentUser: userData, error: null });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to login' });
      return false;
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ currentUser: null, error: null });
      clearAuthCache();
    } catch (error) {
      console.error('Logout error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to logout' });
    }
  },

  updateUser: async (updates: Partial<User>) => {
    const { currentUser } = get();
    if (!currentUser) {
      set({ error: 'No user logged in' });
      return false;
    }

    try {
      // Update auth email if it's being changed
      if (updates.email) {
        const { error } = await supabase.auth.updateUser({
          email: updates.email
        });
        if (error) throw error;
      }

      // Ensure preferences are properly merged
      const updatedUser = { ...currentUser };
      if (updates.preferences) {
        updatedUser.preferences = {
          ...defaultPreferences,
          ...currentUser.preferences,
          ...updates.preferences,
          notifications: {
            ...defaultNotificationPreferences,
            ...(currentUser.preferences?.notifications || {}),
            ...(updates.preferences.notifications || {})
          }
        };
      }

      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          notification_preferences: updatedUser.preferences.notifications,
          // Add other profile fields here
        })
        .eq('id', currentUser.id);

      if (profileError) throw profileError;

      set({
        currentUser: { ...updatedUser, ...updates },
        error: null
      });
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update user' });
      return false;
    }
  },

  updatePassword: async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update password' });
      return false;
    }
  }
}));
