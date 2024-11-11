import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import type { User } from '../types';

const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Andres',
    email: 'andypamo@gmail.com',
    role: 'partner1',
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
  },
  {
    id: '2',
    name: 'Antonio',
    email: 'antoniojsmith@protonmail.com',
    role: 'partner2',
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
  },
];

interface UserState {
  users: User[];
  currentUser: User | null;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => void;
  initializeDefaultUser: () => void;
  setCurrentUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: defaultUsers,
      currentUser: null,
      error: null,

      initializeDefaultUser: () => {
        const { currentUser, users } = get();
        if (!currentUser && users.length > 0) {
          set({ currentUser: users[1] }); // Set Antonio as default user
        }
      },

      setCurrentUser: (user: User | null) => {
        set({ currentUser: user });
      },

      login: async (email: string, password: string) => {
        try {
          // Authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log('Firebase Auth user:', userCredential.user);
          
          // Find the user in our local store by email
          const user = get().users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase()
          );
          
          if (user) {
            set({ currentUser: user, error: null });
            return true;
          }
          
          set({ error: 'User not found in local store' });
          return false;
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
        // Initialize default user after rehydration if no user is logged in
        if (state) {
          state.initializeDefaultUser();
          
          // Set up Firebase Auth state listener
          onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
              console.log('Firebase user authenticated:', firebaseUser);
              // Find matching user in our store
              const user = state.users.find(
                (u) => u.email.toLowerCase() === firebaseUser.email?.toLowerCase()
              );
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
