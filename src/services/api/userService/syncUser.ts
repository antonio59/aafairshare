
import { getSupabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { showToast } from "@/components/ui/use-toast";

// Check if authenticated user exists in users table - no creation for closed app
export const syncAuthUser = async (): Promise<User | null> => {
  try {
    // Get supabase client
    const supabase = await getSupabase();
    
    // Get current auth user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;
    
    console.log("Looking up authenticated user:", authUser.email);
    
    // Check if user exists by email
    const { data: existingUserByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .maybeSingle();
    
    // If user exists by email, use that
    if (!emailError && existingUserByEmail) {
      console.log("Found existing user by email:", existingUserByEmail.email);
      return {
        id: existingUserByEmail.id,
        name: existingUserByEmail.username || existingUserByEmail.email.split('@')[0],
        avatar: existingUserByEmail.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${existingUserByEmail.username || existingUserByEmail.email}`
      };
    }
    
    // If not found by email, check by ID
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
    
    // No user found in database - this is a closed app, so return null
    console.log("No existing user found for this account. Access denied.");
    showToast.error("Access denied", "Your account is not authorized to use this application");
    
    // Force logout since this is not an authorized user
    await supabase.auth.signOut({ scope: 'global' });
    return null;
  } catch (error) {
    console.error("Error syncing auth user:", error);
    return null;
  }
};

// Fetch users from the Supabase database
export const getUsers = async (): Promise<User[]> => {
  const supabase = await getSupabase();
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
    avatar: user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.email}`,
    email: user.email // Make sure email is included
  }));
};
