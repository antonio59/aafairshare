import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Andres',
    email: 'andypamo@gmail.com',
    password: '1234',
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
    password: '1234',
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
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  updatePassword: (id: string, newPassword: string) => void;
  initializeDefaultUser: () => void;
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

      login: (email: string, password: string) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        
        if (user) {
          set({ currentUser: user, error: null });
          return true;
        }
        
        set({ error: 'Invalid email or password' });
        return false;
      },

      logout: () => {
        set((state) => {
          // Clear the persisted state
          localStorage.removeItem('user-storage');
          return { currentUser: null, error: null };
        });
      },

      updateUser: (id: string, updates: Partial<User>) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
          currentUser: state.currentUser?.id === id 
            ? { ...state.currentUser, ...updates }
            : state.currentUser,
          error: null
        }));
      },

      updatePassword: (id: string, newPassword: string) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, password: newPassword } : u
          ),
          currentUser: state.currentUser?.id === id 
            ? { ...state.currentUser, password: newPassword }
            : state.currentUser,
          error: null
        }));
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
        }
      },
    }
  )
);
