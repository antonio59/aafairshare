
import { supabase } from "@/integrations/supabase/client";

// Fetch users from the Supabase database
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, photo_url');
  
  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
  
  return data.map(user => ({
    id: user.id,
    name: user.username || user.email.split('@')[0],
    avatar: user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.email}`
  }));
};
