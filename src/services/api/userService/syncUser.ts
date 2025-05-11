
import { getSupabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { showToast } from "@/components/ui/use-toast";

// Check if authenticated user exists in users table and create if not
export const syncAuthUser = async (): Promise<User | null> => {
  try {
    // Get supabase client
    const supabase = await getSupabase();
    
    // Get current auth user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;
    
    console.log("Syncing auth user:", authUser.email);
    
    // Check if user already exists by email first before attempting any updates
    const { data: existingUserByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .maybeSingle();
    
    // If user exists by email, just use that
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
    
    // No user found, create a new one only if we really need to
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
      
      // As a last resort, try to get the user one more time
      const { data: finalFallbackUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .maybeSingle();
        
      if (finalFallbackUser) {
        console.log("Found user in final fallback:", finalFallbackUser.email);
        return {
          id: finalFallbackUser.id,
          name: finalFallbackUser.username || finalFallbackUser.email.split('@')[0],
          avatar: finalFallbackUser.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalFallbackUser.username || finalFallbackUser.email}`
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
