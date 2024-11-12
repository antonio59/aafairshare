import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updatePassword as firebaseUpdatePassword 
} from 'firebase/auth';
import { auth } from '../firebase';
import type { User } from '../types';
import { handleAuthError } from '../utils/authUtils';

interface UserState {
  users: User[];
  currentUser: User | null;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      error: null,

      setCurrentUser: (user: User | null) => {
        set({ currentUser: user });
      },

      login: async (email: string, password: string) => {
        try {
          console.log('Attempting login for:', email);
          
          // First try to get existing user credentials
          let userCredential;
          try {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Firebase auth successful:', userCredential.user);
            
            // Force token refresh
            await userCredential.user.getIdToken(true);
          } catch (authError) {
            console.error('Firebase auth error:', authError);
            throw authError;
          }
          
          // Create user object
          const user: User = {
            id: userCredential.user.uid,
            name: userCredential.user.displayName || email.split('@')[0],
            email: userCredential.user.email || email,
            role: email.toLowerCase() === 'andypamo@gmail.com' ? 'partner1' : 'partner2',
            preferences: {
              currency: 'GBP',
              favicon: '',
              notifications: {
                overBudget: true,
                monthlyReminder: true,
                monthEndReminder: true,
                monthlyAnalytics: true,
              },
            },
          };

          // Update users array and current user
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
                  ...updatedUsers[existingUserIndex].preferences,
                  ...user.preferences
                }
              };
            }

            return {
              users: updatedUsers,
              currentUser: user,
              error: null
            };
          });

          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({ currentUser: null, error: 'Invalid email or password' });
          throw error;
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ currentUser: null, error: null });
        } catch (error) {
          console.error('Logout error:', error);
          set({ error: 'Failed to logout', currentUser: null });
        }
      },

      updateUser: async (updates: Partial<User>) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('No user logged in');

        set((state) => {
          const updatedUsers = state.users.map((u) =>
            u.id === currentUser.id ? { ...u, ...updates } : u
          );
          
          return {
            users: updatedUsers,
            currentUser: { ...currentUser, ...updates },
            error: null
          };
        });
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
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Set up Firebase Auth state listener
          onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              console.log('Firebase user authenticated:', firebaseUser.email);
              try {
                // Force token refresh
                await firebaseUser.getIdToken(true);
                
                // Find matching user in our store
                const user = state.users.find(u => u.id === firebaseUser.uid);
                
                if (user && user !== state.currentUser) {
                  state.setCurrentUser(user);
                } else if (!user) {
                  // Create new user if not found
                  const newUser: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
                    email: firebaseUser.email || '',
                    role: firebaseUser.email?.toLowerCase() === 'andypamo@gmail.com' ? 'partner1' : 'partner2',
                    preferences: {
                      currency: 'GBP',
                      favicon: '',
                      notifications: {
                        overBudget: true,
                        monthlyReminder: true,
                        monthEndReminder: true,
                        monthlyAnalytics: true,
                      },
                    },
                  };
                  state.setCurrentUser(newUser);
                }
              } catch (error) {
                console.error('Error in auth state change:', error);
                state.setCurrentUser(null);
              }
            } else {
              console.log('No Firebase user');
              state.setCurrentUser(null);
            }
          });
        }
      },
    }
  )
);
