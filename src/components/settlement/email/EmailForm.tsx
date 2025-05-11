
import { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmailSendingService, TestEmailConfig } from "@/services/api/email";

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

  const handleSendTest = async () => {
    if (users.length < 2) {
      toast({
        title: "Error",
        description: "Need at least two users to send test email",
        variant: "destructive",
      });
      return;
    }

    onSendStart();

    try {
      const result = await EmailSendingService.sendTestEmail(users, testConfig);
      
      if (result.success) {
        toast({
          title: "Email Sent Successfully",
          description: result.message,
        });
        onSuccess();
      } else {
        throw new Error(result.errorMessage);
      }
      
    } catch (error: any) {
      console.error("Error sending test email:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // Store stack trace if available
      if (error instanceof Error && error.stack) {
        onError(errorMessage, error.stack);
      } else {
        onError(errorMessage);
      }
      
      toast({
        title: "Failed to Send Email",
        description: errorMessage,
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
          Send Test Email
        </>
      )}
    </Button>
  );
};
