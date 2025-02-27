import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Test the server-side authentication
 * This function can be used in a server component to test if authentication is working correctly
 */
export async function testServerAuth() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Server Auth Test: Error getting session', error);
      return { success: false, error };
    }
    
    return { 
      success: true, 
      data: {
        isAuthenticated: !!data.session,
        user: data.session?.user
      }
    };
  } catch (error) {
    console.error('Server Auth Test: Unexpected error', error);
    return { success: false, error };
  }
}
