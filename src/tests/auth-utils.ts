'use client';

import { getSupabaseClient } from '@/lib/supabase-client';

/**
 * Test the client-side authentication
 * This function is used to test if the authentication is working correctly on the client side
 */
export async function testClientAuth() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Client Auth Test: Error getting session', error);
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
    console.error('Client Auth Test: Unexpected error', error);
    return { success: false, error };
  }
}
