
import { User } from "@/types";
import { getSupabase } from "@/integrations/supabase/client";
import { TestEmailConfig, EmailSendingResult } from "./types";
import { EmailAvailabilityService } from "./emailAvailabilityService";
import { EmailFormDataService } from "./emailFormDataService";

/**
 * Service for sending settlement emails
 */
export class EmailSendingService {
  /**
   * Send test email to users
   */
  static async sendTestEmail(users: User[], config?: TestEmailConfig): Promise<EmailSendingResult> {
    try {
      if (users.length < 2) {
        return {
          success: false,
          errorMessage: "Need at least two users to send test email"
        };
      }

      // Check if all users have email addresses
      const usersWithEmail = users.filter(user => 'email' in user && user.email);
      if (usersWithEmail.length < 2) {
        return {
          success: false,
          errorMessage: "Both users must have email addresses"
        };
      }

      // Get Supabase client first so we fail early if there's an authentication issue
      const supabase = await getSupabase();
      
      // Check if the function is available
      try {
        const isAvailable = await EmailAvailabilityService.checkFunctionAvailability();
        if (!isAvailable) {
          throw new Error("The edge function appears to be unavailable. Please check your Supabase deployment or try again later.");
        }
      } catch (error) {
        console.log("Edge function check error, continuing anyway:", error);
        // Continue even with availability check errors - the actual function call will fail if there's a real issue
      }
      
      // Prepare form data
      const { formData } = await EmailFormDataService.prepareFormData(users, config);
      
      console.log("Invoking edge function send-settlement-email");

      // Call the edge function with proper headers
      const { data, error } = await supabase.functions.invoke("send-settlement-email", {
        body: formData,
        headers: {
          'Request-Timeout': '30000ms', // Increased to 30 seconds timeout
          'Content-Type': 'multipart/form-data'  
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data?.success) {
        console.error("Edge function returned error:", data?.error || "Unknown error");
        throw new Error(data?.error || "Unknown error from edge function");
      }

      console.log("Email sent successfully:", data);
      const emailAddresses = users.slice(0, 2).map(user => 
        'email' in user && user.email ? user.email : 'No email'
      ).join(' and ');
      
      return {
        success: true,
        message: `Test settlement email was sent to ${emailAddresses}`
      };
      
    } catch (error: any) {
      console.error("Error sending test email:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // Return error details
      return {
        success: false,
        errorMessage,
        errorTrace: error instanceof Error ? error.stack : undefined
      };
    }
  }
}
