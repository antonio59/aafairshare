
import { getSupabase } from "@/integrations/supabase/client";

/**
 * Service to check the availability of email-related Supabase functions
 */
export class EmailAvailabilityService {
  /**
   * Check if the Supabase email function is available
   */
  static async checkFunctionAvailability(): Promise<boolean> {
    try {
      const supabase = await getSupabase();
      
      // Make a simple OPTIONS request to check if the function is available
      const response = await fetch(`https://gsvyxsddmddipeoduyys.supabase.co/functions/v1/send-settlement-email`, {
        method: 'OPTIONS',
        headers: {
          'apikey': (await supabase.auth.getSession()).data.session?.access_token || '',
        }
      });
      
      return response.ok;
    } catch (error) {
      console.warn("Function availability check failed:", error);
      return false;
    }
  }
}
