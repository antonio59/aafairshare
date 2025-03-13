export interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, name: string) => Promise<AuthResponse>;
  signOut: () => Promise<AuthResponse>;
  refreshSession: () => Promise<boolean>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
  clearError: () => void;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
  resetAuthState: () => Promise<boolean>;
} 