
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

interface User {
  id: string;
  email: string;
  name: string;
}

interface UsersResult {
  user1: User;
  user2: User;
}

/**
 * Get user data from Supabase
 */
export async function getUsersData(
  supabase: SupabaseClient,
  user1Id: string,
  user2Id: string
): Promise<UsersResult> {
  console.log(`Fetching data for users: ${user1Id} and ${user2Id}`);
  
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, email, username')
    .in('id', [user1Id, user2Id]);

  if (userError) {
    console.error("Error fetching user data:", userError);
    throw new Error(`Error fetching user data: ${userError.message}`);
  }
  
  if (!users || users.length < 2) {
    console.error("Users not found in database:", { users });
    throw new Error(`Error fetching user data: ${users ? 'Not enough users found' : 'Users not found'}`);
  }

  // Get user info
  const user1 = users.find(u => u.id === user1Id);
  const user2 = users.find(u => u.id === user2Id);
  
  if (!user1 || !user2) {
    console.error("Unable to find both users", { user1, user2 });
    throw new Error("Could not find both users");
  }
  
  if (!user1.email || !user2.email) {
    console.error("Missing email addresses", { user1Email: user1.email, user2Email: user2.email });
    throw new Error("Could not find valid email addresses for both users");
  }

  return { 
    user1: {
      id: user1.id,
      email: user1.email,
      name: user1.username || user1.email.split('@')[0]
    }, 
    user2: {
      id: user2.id,
      email: user2.email,
      name: user2.username || user2.email.split('@')[0]
    } 
  };
}
