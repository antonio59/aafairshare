
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
      .maybeSingle();
    
    if (!fetchError && existingUser) {
      console.log("Found existing user by ID:", existingUser.id);
      return {
        id: existingUser.id,
        name: existingUser.username || existingUser.email.split('@')[0],
        avatar: existingUser.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${existingUser.username || existingUser.email}`
      };
    }
    
    // User doesn't exist by ID, check by email to handle migration cases
    const { data: emailUser, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .maybeSingle();
    
    if (!emailError && emailUser) {
      console.log("Found user by email:", emailUser.email);
      // User exists with this email but different ID, update the ID
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ id: authUser.id })
        .eq('email', authUser.email)
        .select()
        .maybeSingle();
      
      if (!updateError && updatedUser) {
        console.log("Updated user ID for:", updatedUser.email);
        return {
          id: updatedUser.id,
          name: updatedUser.username || updatedUser.email.split('@')[0],
          avatar: updatedUser.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${updatedUser.username || updatedUser.email}`
        };
      }
    }
    
    // No user found, create new user
    let username = authUser.user_metadata?.name || authUser.email?.split('@')[0] || null;
    
    console.log("Creating new user for:", authUser.email);
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        id: authUser.id,
        email: authUser.email,
        username: username,
        photo_url: authUser.user_metadata?.avatar_url || null
      }])
      .select()
      .single();
    
    if (createError) {
      console.error("Error creating user:", createError);
      
      // As a fallback, try to get the user once more
      const { data: retryUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .maybeSingle();
        
      if (retryUser) {
        console.log("Found user in fallback:", retryUser.email);
        return {
          id: retryUser.id,
          name: retryUser.username || retryUser.email.split('@')[0],
          avatar: retryUser.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${retryUser.username || retryUser.email}`
        };
      }
      
      return null;
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
    console.log("Getting current user...");
    
    // Get the current auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return null;
    }
    
    if (!session) {
      console.log("No active session");
      return null;
    }
    
    console.log("Active session found for user:", session.user.email);
    
    // Find the user in our database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, photo_url')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching current user:", error);
      // Try sync if query fails
      return await syncAuthUser();
    }
    
    if (!user) {
      console.log("User not found in database, trying to sync");
      // Try syncing the user if not found
      return await syncAuthUser();
    }
    
    console.log("User found in database:", user.email);
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
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Do the same for sessionStorage
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };
  
  try {
    cleanupAuthState();
    await supabase.auth.signOut({ scope: 'global' });
  } catch (error) {
    console.error("Error during logout:", error);
    // Still clean up even if signOut fails
    cleanupAuthState();
    throw error;
  }
};
