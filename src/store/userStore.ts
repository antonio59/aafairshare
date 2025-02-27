'use client';

import { create } from 'zustand';
import { getSupabaseClient } from '@/lib/supabase-client';
import { User } from '@supabase/supabase-js';

export interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  profile: any | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Session actions
  checkSession: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
  
  // Profile actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  profile: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      set({
        user: data.user,
        isAuthenticated: !!data.user,
        isLoading: false,
      });
      
      // Fetch user profile after successful login
      await get().fetchProfile();
    } catch (error) {
      console.error('Login error:', error);
      set({
        error: error as Error,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },
  
  loginWithProvider: async (provider) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      // Note: This won't actually set the user as the page will redirect
      set({ isLoading: false });
    } catch (error) {
      console.error(`${provider} login error:`, error);
      set({
        error: error as Error,
        isLoading: false,
      });
      throw error;
    }
  },
  
  signup: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      set({
        isLoading: false,
        // Note: User may not be fully authenticated yet if email confirmation is required
      });
    } catch (error) {
      console.error('Signup error:', error);
      set({
        error: error as Error,
        isLoading: false,
      });
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({
        user: null,
        isAuthenticated: false,
        profile: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({
        error: error as Error,
        isLoading: false,
      });
      throw error;
    }
  },
  
  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Password reset error:', error);
      set({
        error: error as Error,
        isLoading: false,
      });
      throw error;
    }
  },
  
  checkSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      const isAuthenticated = !!data.session?.user;
      
      set({
        user: data.session?.user || null,
        isAuthenticated,
        isLoading: false,
      });
      
      // If user is authenticated, fetch their profile
      if (isAuthenticated) {
        await get().fetchProfile();
      }
      
      return isAuthenticated;
    } catch (error) {
      console.error('Session check error:', error);
      set({
        error: error as Error,
        isLoading: false,
        isAuthenticated: false,
      });
      return false;
    }
  },
  
  refreshSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      set({
        user: data.session?.user || null,
        isAuthenticated: !!data.session?.user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Session refresh error:', error);
      set({
        error: error as Error,
        isLoading: false,
      });
      throw error;
    }
  },
  
  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;
    
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      set({
        profile: data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      set({
        error: error as Error,
        isLoading: false,
      });
      // Don't throw here as this is not a critical error
    }
  },
  
  updateProfile: async (profileData) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');
    
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      set({
        profile: data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      set({
        error: error as Error,
        isLoading: false,
      });
      throw error;
    }
  },
}));
