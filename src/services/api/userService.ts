
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
    
    if (!fetchError && existingUser) {
      return {
        id: existingUser.id,
        name: existingUser.username || existingUser.email.split('@')[0],
        avatar: existingUser.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${existingUser.username || existingUser.email}`
      };
    }
    
    if (fetchError && fetchError.code !== 'PGRST116') { // Not found is ok
      console.error("Error fetching user:", fetchError);
    }
    
    // User doesn't exist, create a new user record
    let username = authUser.user_metadata?.name || authUser.email?.split('@')[0] || null;
    
    // Look for existing user by email to prevent duplication
    const { data: emailCheck } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .maybeSingle();
    
    if (emailCheck) {
      // If email exists but with different ID, update that user with new auth ID
      // We use a conditional update to avoid foreign key conflicts
      if (emailCheck.id !== authUser.id) {
        try {
          // First, get all references to old user ID from other tables
          // For this app, we need to handle the expenses table reference
          const { data: expensesData } = await supabase
            .from('expenses')
            .select('*')
            .eq('paid_by_id', emailCheck.id);
          
          // If there are expenses, we need to create the user with new ID
          // instead of updating existing user (to avoid FK constraint issues)
          if (expensesData && expensesData.length > 0) {
            // Create a new user entry with auth ID 
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
              return null;
            }
            
            return {
              id: newUser.id,
              name: newUser.username || newUser.email.split('@')[0],
              avatar: newUser.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.username || newUser.email}`
            };
          } else {
            // Safe to update existing user with new auth ID
            const { data: updatedUser, error: updateError } = await supabase
              .from('users')
              .update({ id: authUser.id })
              .eq('id', emailCheck.id)
              .select()
              .single();
            
            if (updateError) {
              console.error("Error updating user:", updateError);
              return null;
            }
            
            return {
              id: updatedUser.id,
              name: updatedUser.username || updatedUser.email.split('@')[0],
              avatar: updatedUser.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${updatedUser.username || updatedUser.email}`
            };
          }
        } catch (err) {
          console.error("Error handling existing user:", err);
          // Fall through to using existing user as-is
        }
      }
      
      // Use existing user data
      return {
        id: emailCheck.id,
        name: emailCheck.username || emailCheck.email.split('@')[0],
        avatar: emailCheck.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailCheck.username || emailCheck.email}`
      };
    }
    
    // Create new user if no duplicates
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
    // Get the current auth session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return null;
    
    // Find the user in our database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, photo_url')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching current user:", error);
      return null;
    }
    
    if (!user) {
      // Try syncing the user if not found
      return await syncAuthUser();
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
