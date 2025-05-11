
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
      if (!supabase) {
        throw new Error("Failed to initialize Supabase client");
      }
      
      console.log("Supabase client initialized successfully");
      
      // Check if the edge function is available
      try {
        const functionAvailable = await EmailAvailabilityService.checkFunctionAvailability();
        console.log("Edge function availability check result:", functionAvailable);
      } catch (err) {
        console.warn("Function availability check failed:", err);
        // Continue anyway as the check is not critical
      }
      
      // Prepare form data
      console.log("Preparing form data...");
      const { formData } = await EmailFormDataService.prepareFormData(users, config);
      
      console.log("Invoking edge function send-settlement-email");

      // Call the edge function with proper headers
      const { data, error } = await supabase.functions.invoke("send-settlement-email", {
        body: formData,
        headers: {
          'Request-Timeout': '60000ms', // Increased to 60 seconds timeout
          'Content-Type': 'multipart/form-data'  
        }
      });

      if (error) {
        console.error("Edge function error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: error.context
        });
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
      
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more helpful error message for common issues
        if (errorMessage.includes("Failed to fetch") || errorMessage.includes("network")) {
          errorMessage = "Unable to connect to the email service. This could be due to network issues or the edge function may be unavailable.";
        } else if (errorMessage.includes("timeout")) {
          errorMessage = "The request timed out while trying to send the email. The server might be busy or experiencing issues.";
        }
      }
      
      // Return error details
      return {
        success: false,
        errorMessage,
        errorTrace: error instanceof Error ? error.stack : undefined
      };
    }
  }
}
