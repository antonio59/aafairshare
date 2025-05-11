
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

// Check if authenticated user exists in users table and create if not
export const syncAuthUser = async (): Promise<User | null> => {
  try {
    // Get current auth user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;
    
    // Check if user exists in our users table
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // Not found is ok
      console.error("Error fetching user:", fetchError);
      throw fetchError;
    }
    
    // If user exists, return it
    if (existingUser) {
      return {
        id: existingUser.id,
        name: existingUser.username || existingUser.email.split('@')[0],
        avatar: existingUser.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${existingUser.username || existingUser.email}`
      };
    }
    
    // User doesn't exist, create a new user record
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        id: authUser.id,
        email: authUser.email,
        username: authUser.user_metadata?.name || authUser.email?.split('@')[0] || null,
        photo_url: authUser.user_metadata?.avatar_url || null
      }])
      .select()
      .single();
    
    if (createError) {
      console.error("Error creating user:", createError);
      throw createError;
    }
    
    return {
      id: newUser.id,
      name: newUser.username || newUser.email.split('@')[0],
      avatar: newUser.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.username || newUser.email}`
    };
  } catch (error) {
    console.error("Error syncing auth user:", error);
    return null;
  }
};

// Fetch users from the Supabase database
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, photo_url');
  
  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
  
  return data.map(user => ({
    id: user.id,
    name: user.username || user.email.split('@')[0], // Use username or fallback to email
    avatar: user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.email}`
  }));
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get the current auth session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return null;
    
    // Find the user in our database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, photo_url')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
    
    return {
      id: user.id,
      name: user.username || user.email.split('@')[0],
      avatar: user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.email}`
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Logout the current user
export const logoutUser = async (): Promise<void> => {
  // Clean up auth state
  localStorage.removeItem('supabase.auth.token');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};
