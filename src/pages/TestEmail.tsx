
import { useState, useEffect } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/services/api/userService";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { EmailStatus } from "@/components/settlement/email/EmailStatus";
import { EmailPreview } from "@/components/settlement/email/EmailPreview";
import { EmailForm } from "@/components/settlement/email/EmailForm";
import { EmailConfigForm, TestEmailConfig } from "@/components/settlement/email/EmailConfigForm";
import { User } from "@/types";

interface ExtendedUser extends User {
  email: string;
}

const TestEmail = () => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [errorTrace, setErrorTrace] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Default test configuration
  const [testConfig, setTestConfig] = useState<TestEmailConfig>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    settlementAmount: 25.13,
    settlementDirection: "owes"
  });

  useEffect(() => {
    // Check if Supabase is initialized before allowing the component to work
    const checkSupabase = async () => {
      try {
        const supabase = await getSupabase();
        // Just a simple check to see if we can get the current session
        await supabase.auth.getSession();
        setIsSupabaseReady(true);
        setErrorDetails(null);
      } catch (error) {
        console.error("Supabase is not ready yet:", error);
        setErrorDetails("Could not initialize Supabase client. Please try again later.");
        // Retry after a short delay
        setTimeout(checkSupabase, 1500);
      }
    };
    
    checkSupabase();
  }, [retryCount]);

  const { data: fetchedUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: isSupabaseReady, // Only run this query when Supabase is ready
  });
  
  // Type assertion to make TypeScript happy
  const users = fetchedUsers as ExtendedUser[];

  const handleRetryConnection = () => {
    setRetryCount(prev => prev + 1);
    setErrorDetails("Retrying Supabase connection...");
    toast({
      title: "Retrying Connection",
      description: "Attempting to reconnect to Supabase...",
    });
  };
  
  const handleSendSuccess = () => {
    setIsSending(false);
    setSuccess(true);
  };
  
  const handleSendError = (errorMessage: string, errorTrace?: string) => {
    setIsSending(false);
    setErrorDetails(errorMessage);
    if (errorTrace) {
      setErrorTrace(errorTrace);
    }
  };
  
  const handleSendStart = () => {
    setIsSending(true);
    setSuccess(false);
    setErrorDetails(null);
    setErrorTrace(null);
  };
  
  const handleConfigChange = (newConfig: TestEmailConfig) => {
    setTestConfig(newConfig);
    toast({
      title: "Configuration Updated",
      description: "Test email configuration has been updated."
    });
  };

  return (
    <div className="container py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Settlement Email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This page allows you to test the settlement email function by sending a test email to the users in your account.
          </p>
          
          <EmailStatus 
            isSupabaseReady={isSupabaseReady}
            isLoadingUsers={isLoadingUsers}
            isSending={isSending}
            success={success}
            errorDetails={errorDetails}
            errorTrace={errorTrace}
            onRetryConnection={handleRetryConnection}
          />
          
          {isSupabaseReady && !isLoadingUsers && (
            <>
              <EmailPreview 
                users={users}
                usersMinRequired={2}
                testData={testConfig}
              />
              
              <EmailConfigForm
                config={testConfig}
                onConfigChange={handleConfigChange}
              />
            </>
          )}
        </CardContent>
        <CardFooter>
          <EmailForm 
            users={users}
            testConfig={testConfig}
            isSupabaseReady={isSupabaseReady}
            isSending={isSending}
            isLoadingUsers={isLoadingUsers}
            success={success}
            onSuccess={handleSendSuccess}
            onError={handleSendError}
            onSendStart={handleSendStart}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestEmail;
