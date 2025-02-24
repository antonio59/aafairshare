import type { User as SupabaseUser } from '@supabase/supabase-js';

export type NotificationChannel = 'email' | 'push' | 'inApp';

export interface BudgetNotificationSetting {
  enabled: boolean;
  threshold?: number;
  channels?: NotificationChannel[];
}

export interface ChanneledNotificationSetting {
  enabled: boolean;
  channels?: NotificationChannel[];
}

export interface TimedNotificationSetting {
  enabled: boolean;
  day?: number;
  channels?: NotificationChannel[];
}

export interface NotificationPreferences {
  globalEnabled: boolean;
  overBudget: BudgetNotificationSetting;
  settlementNotifications: ChanneledNotificationSetting;
  monthlyReminder: TimedNotificationSetting;
}

export interface User extends SupabaseUser {
  id: string;
  email: string;
  preferences: {
    currency: string;
    notifications: NotificationPreferences;
  };
}

export interface UserStore {
  users: User[];
  currentUser: User | null;
  error: string | null;
  isInitialized: boolean;
  setInitialized: (value: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}
