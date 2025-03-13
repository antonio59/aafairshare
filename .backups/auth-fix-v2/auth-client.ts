// Re-export the consolidated Supabase client and auth functions
// This file is kept for backward compatibility
import { supabase as authClient, directSignIn, directSignUp } from './supabase';

export { authClient, directSignIn, directSignUp }; 