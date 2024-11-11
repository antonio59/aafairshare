import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import type { User } from '../types';

interface UserState {
  users: User[];
  currentUser: User | null;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => void;
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
          // Authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Create or update user in local store based on Firebase user
          const user: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || email.split('@')[0],
            email: firebaseUser.email || email,
            role: 'partner1', // Default role, can be updated later
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

          // Update users array if user doesn't exist
          set((state) => {
            const existingUserIndex = state.users.findIndex(u => u.id === user.id);
            const updatedUsers = [...state.users];
            
            if (existingUserIndex === -1) {
              updatedUsers.push(user);
            } else {
              updatedUsers[existingUserIndex] = user;
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
          set({ error: 'Invalid email or password' });
          return false;
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set((state) => {
            // Clear the persisted state
            localStorage.removeItem('user-storage');
            return { currentUser: null, error: null };
          });
        } catch (error) {
          console.error('Logout error:', error);
          set({ error: 'Failed to logout' });
        }
      },

      updateUser: (id: string, updates: Partial<User>) => {
        set((state) => {
          const updatedUsers = state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          );
          const updatedCurrentUser = state.currentUser?.id === id 
            ? { ...state.currentUser, ...updates }
            : state.currentUser;
          
          return {
            users: updatedUsers,
            currentUser: updatedCurrentUser,
            error: null
          };
        });
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
          onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
              console.log('Firebase user authenticated:', firebaseUser);
              // Find matching user in our store
              const user = state.users.find(u => u.id === firebaseUser.uid);
              if (user && user !== state.currentUser) {
                state.setCurrentUser(user);
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
