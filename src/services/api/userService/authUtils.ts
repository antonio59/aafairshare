
import { getSupabase } from "@/integrations/supabase/client";
import { showToast } from "@/components/ui/use-toast";

// Clean up auth state utility function - more thorough cleanup
export const cleanupAuthState = (): void => {
  console.log("Cleaning up auth state");
  
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('aafairshare-auth')) {
      console.log(`Removing localStorage item: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Do the same for sessionStorage
  try {
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('aafairshare-auth')) {
          console.log(`Removing sessionStorage item: ${key}`);
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (e) {
    console.error("Error cleaning sessionStorage:", e);
  }
  
  // Also remove project-specific error markers
  localStorage.removeItem('auth-error-detected');
};

// Logout the current user
export const logoutUser = async (): Promise<void> => {
  try {
    showToast.info("Logging out...");
    
    // Try to sign out first
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut({ scope: 'global' });
      console.log("Successfully signed out from Supabase");
    } catch (err) {
      console.error("Error during signOut:", err);
      // Continue even if this fails
    }
    
    // Then clean up regardless of signOut success
    cleanupAuthState();
    
    showToast.success("Logged out successfully");
    
    // Force page reload for clean state
    window.location.href = '/login';
  } catch (error) {
    console.error("Error during logout:", error);
    // Still clean up even if signOut fails
    cleanupAuthState();
    // Force reload even on error for clean state
    window.location.href = '/login';
  }
};
