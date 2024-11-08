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
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  updatePassword: (id: string, newPassword: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: defaultUsers,
      currentUser: null,

      login: (email: string, password: string) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null });
      },

      updateUser: (id: string, updates: Partial<User>) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
          currentUser: state.currentUser?.id === id 
            ? { ...state.currentUser, ...updates }
            : state.currentUser,
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
        }));
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
      }),
    }
  )
);