
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/components/ui/use-toast";

// Clean up auth state utility function
export const cleanupAuthState = (): void => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('aafairshare-auth')) {
      localStorage.removeItem(key);
    }
  });
  
  // Do the same for sessionStorage
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('aafairshare-auth')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Also remove project-specific error markers
  localStorage.removeItem('auth-error-detected');
};

// Logout the current user
export const logoutUser = async (): Promise<void> => {
  try {
    showToast.info("Logging out...");
    
    // Try to sign out first
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.error("Error during signOut:", err);
      // Continue even if this fails
    }
    
    // Then clean up regardless of signOut success
    cleanupAuthState();
    
    showToast.success("Logged out successfully");
  } catch (error) {
    console.error("Error during logout:", error);
    // Still clean up even if signOut fails
    cleanupAuthState();
    throw error;
  }
};
