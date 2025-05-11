
import { getSupabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { syncAuthUser } from './syncUser';

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log("Getting current user...");
    
    // Get the current auth session
    const supabase = await getSupabase();
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
