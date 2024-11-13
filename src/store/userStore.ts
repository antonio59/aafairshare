import { create } from 'zustand';
import { signInWithEmailAndPassword, signOut, updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { auth } from '../firebase';
import type { User, NotificationPreferences } from '../types';
import type { UserStore } from './types';
import { clearAuthCache } from '../utils/authUtils';

const initialState = {
  users: [],
  currentUser: null,
  error: null,
  isInitialized: false
};

const defaultNotificationPreferences: NotificationPreferences = {
  globalEnabled: true,
  overBudget: {
    enabled: true,
    emailEnabled: true,
    inAppEnabled: true,
    dismissedAlerts: []
  },
  monthlyReminder: {
    enabled: true,
    time: '17:00' // Set to 5 PM on last day of month
  },
  settlementNotifications: {
    enabled: true,
    emailEnabled: true,
    inAppEnabled: true
  }
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
      }, 1000); // Force initialization after 1 second
    }
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      set((state) => {
        const existingUserIndex = state.users.findIndex(u => u.id === user.id);
        const updatedUsers = [...state.users];
        
        if (existingUserIndex === -1) {
          updatedUsers.push(user);
        } else {
          updatedUsers[existingUserIndex] = {
            ...updatedUsers[existingUserIndex],
            ...user,
            preferences: {
              ...updatedUsers[existingUserIndex]?.preferences,
              ...user.preferences,
              notifications: {
                ...defaultNotificationPreferences,
                ...updatedUsers[existingUserIndex]?.preferences?.notifications,
                ...user.preferences?.notifications,
                // Ensure each notification type has all required properties
                overBudget: {
                  ...defaultNotificationPreferences.overBudget,
                  ...updatedUsers[existingUserIndex]?.preferences?.notifications?.overBudget,
                  ...user.preferences?.notifications?.overBudget
                },
                monthlyReminder: {
                  ...defaultNotificationPreferences.monthlyReminder,
                  ...updatedUsers[existingUserIndex]?.preferences?.notifications?.monthlyReminder,
                  ...user.preferences?.notifications?.monthlyReminder
                },
                settlementNotifications: {
                  ...defaultNotificationPreferences.settlementNotifications,
                  ...updatedUsers[existingUserIndex]?.preferences?.notifications?.settlementNotifications,
                  ...user.preferences?.notifications?.settlementNotifications
                }
              }
            }
          };
        }

        return {
          users: updatedUsers,
          currentUser: user,
          error: null,
          isInitialized: true
        };
      });
    } else {
      set({ 
        currentUser: null, 
        error: null,
        isInitialized: true
      });
    }
  },

  login: async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase auth successful:', userCredential.user);
      
      // Force token refresh
      await userCredential.user.getIdToken(true);
      
      // Create user object with default notification preferences
      const user: User = {
        id: userCredential.user.uid,
        name: userCredential.user.displayName || email.split('@')[0],
        email: userCredential.user.email || email,
        role: email.toLowerCase() === 'andypamo@gmail.com' ? 'partner1' : 'partner2',
        preferences: {
          currency: 'GBP',
          notifications: defaultNotificationPreferences
        },
      };

      // Update store
      get().setCurrentUser(user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        currentUser: null, 
        error: 'Invalid email or password',
        isInitialized: true
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      await clearAuthCache();
      set({ 
        currentUser: null, 
        error: null,
        isInitialized: true
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ 
        error: 'Failed to logout', 
        currentUser: null,
        isInitialized: true
      });
    }
  },

  updateUser: async (updates: Partial<User>) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No user logged in');

    const updatedUser = {
      ...currentUser,
      ...updates,
      preferences: {
        ...currentUser.preferences,
        ...updates.preferences,
        notifications: updates.preferences?.notifications ? {
          ...defaultNotificationPreferences,
          ...currentUser.preferences.notifications,
          ...updates.preferences.notifications,
          // Ensure each notification type has all required properties
          overBudget: {
            ...defaultNotificationPreferences.overBudget,
            ...currentUser.preferences.notifications.overBudget,
            ...updates.preferences.notifications.overBudget
          },
          monthlyReminder: {
            ...defaultNotificationPreferences.monthlyReminder,
            ...currentUser.preferences.notifications.monthlyReminder,
            ...updates.preferences.notifications.monthlyReminder
          },
          settlementNotifications: {
            ...defaultNotificationPreferences.settlementNotifications,
            ...currentUser.preferences.notifications.settlementNotifications,
            ...updates.preferences.notifications.settlementNotifications
          }
        } : currentUser.preferences.notifications
      }
    };

    get().setCurrentUser(updatedUser);
  },

  updatePassword: async (newPassword: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('No user logged in');

    try {
      await firebaseUpdatePassword(firebaseUser, newPassword);
      set({ error: null });
    } catch (error) {
      console.error('Failed to update password:', error);
      throw error;
    }
  },
}));
