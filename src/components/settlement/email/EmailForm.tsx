
import { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmailSendingService } from "@/services/api/email";
import { TestEmailConfig } from "@/services/api/email/types";

interface EmailFormProps {
  users: User[];
  testConfig: TestEmailConfig;
  isSupabaseReady: boolean;
  isSending: boolean;
  isLoadingUsers: boolean;
  success: boolean;
  onSuccess: () => void;
  onError: (errorMessage: string, errorTrace?: string) => void;
  onSendStart: () => void;
}

export const EmailForm = ({
  users,
  testConfig,
  isSupabaseReady,
  isSending,
  isLoadingUsers,
  success,
  onSuccess,
  onError,
  onSendStart,
}: EmailFormProps) => {
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);

  const handleSendTest = async () => {
    // Validate that we have at least two users
    if (users.length < 2) {
      toast({
        title: "Error",
        description: "Need at least two users to send test email",
        variant: "destructive",
      });
      return;
    }

    // Check if users have email property
    const usersWithEmail = users.filter(user => 'email' in user && user.email);
    if (usersWithEmail.length < 2) {
      toast({
        title: "Error",
        description: "Both users must have email addresses in the database. Please ensure the users have valid email addresses.",
        variant: "destructive",
      });
      return;
    }

    onSendStart();
    setRetryCount(prev => prev + 1);

    try {
      // Pass only the first two users with emails
      const result = await EmailSendingService.sendTestEmail(
        usersWithEmail.slice(0, 2),
        testConfig
      );
      
      if (result.success) {
        toast({
          title: "Email Sent Successfully",
          description: result.message,
        });
        onSuccess();
      } else {
        throw new Error(result.errorMessage || "Failed to send email");
      }
      
    } catch (error: any) {
      console.error("Error sending test email:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // Provide more helpful error message for common issues
      let userFriendlyMessage = errorMessage;
      
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("network") || errorMessage.includes("connect")) {
        userFriendlyMessage = "Unable to connect to the email service. This could be due to network issues or the edge function may be unavailable. Please try again later.";
      } else if (errorMessage.includes("timeout")) {
        userFriendlyMessage = "The request timed out while trying to send the email. The server might be busy or experiencing issues.";
      }
      
      // Store stack trace if available
      if (error instanceof Error && error.stack) {
        onError(userFriendlyMessage, error.stack);
      } else {
        onError(userFriendlyMessage);
      }
      
      toast({
        title: "Failed to Send Email",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleSendTest} 
      disabled={!isSupabaseReady || isSending || isLoadingUsers || users.length < 2}
      className="w-full"
    >
      {isSending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending Email...
        </>
      ) : success ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Send Another Test Email
        </>
      ) : (
        <>
          <Mail className="mr-2 h-4 w-4" />
          Send Test Email {retryCount > 1 ? `(Attempt ${retryCount})` : ''}
        </>
      )}
    </Button>
  );
};
