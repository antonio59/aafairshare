import { useState, useEffect } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/services/api/userService";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Check, AlertCircle, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSettlementReportPDF } from "@/services/export/settlementReportService";
import { exportToCSV } from "@/services/export/csvExportService";
import { User, Expense } from "@/types";

// Extended user type that includes email
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

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: isSupabaseReady, // Only run this query when Supabase is ready
  }) as { data: ExtendedUser[], isLoading: boolean };

  const handleSendTest = async () => {
    if (users.length < 2) {
      toast({
        title: "Error",
        description: "Need at least two users to send test email",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setSuccess(false);
    setErrorDetails(null);
    setErrorTrace(null);

    try {
      // Generate sample data
      const testYear = new Date().getFullYear();
      const testMonth = new Date().getMonth() + 1;
      
      // Create sample data with correct expense format
      const sampleExpenses: Expense[] = [
        {
          id: "test-1",
          description: "Groceries",
          amount: 85.25,
          date: new Date().toISOString(),
          category: "Food",
          location: "Supermarket",
          paidBy: users[0].id,
          split: "50/50"
        },
        {
          id: "test-2",
          description: "Dinner",
          amount: 65.50,
          date: new Date().toISOString(),
          category: "Food",
          location: "Restaurant",
          paidBy: users[1].id,
          split: "50/50"
        }
      ];
      
      const sampleMonthData = {
        totalExpenses: 350.75,
        user1Paid: 200.50,
        user2Paid: 150.25,
        settlement: 25.125,
        settlementDirection: "owes" as const, // Use 'as const' to specify literal type
        expenses: sampleExpenses
      };
      
      // Generate PDF report
      const pdfReport = generateSettlementReportPDF(
        {
          totalExpenses: sampleMonthData.totalExpenses,
          user1Paid: sampleMonthData.user1Paid,
          user2Paid: sampleMonthData.user2Paid,
          settlement: sampleMonthData.settlement,
          settlementDirection: sampleMonthData.settlementDirection
        },
        testYear,
        testMonth,
        users[0].name,
        users[1].name
      );
      
      // Generate CSV report
      const csvContent = exportToCSV(sampleExpenses, testYear, testMonth);
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // Prepare form data
      const formData = new FormData();
      formData.append("year", testYear.toString());
      formData.append("month", testMonth.toString());
      formData.append("user1", users[0].id);
      formData.append("user2", users[1].id);
      formData.append("settlementAmount", sampleMonthData.settlement.toString());
      formData.append("settlementDirection", sampleMonthData.settlementDirection);
      formData.append("reportPdf", pdfReport, `test_settlement_${testYear}_${testMonth}.pdf`);
      formData.append("reportCsv", csvBlob, `test_expenses_${testYear}_${testMonth}.csv`);

      // Get Supabase client
      const supabase = await getSupabase();
      
      console.log("Invoking edge function send-settlement-email");

      // Call the edge function with updated parameters
      const { data, error } = await supabase.functions.invoke("send-settlement-email", {
        body: formData,
        headers: {
          'Request-Timeout': '15000ms' // 15 seconds timeout
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

      toast({
        title: "Email Sent Successfully",
        description: `Test settlement email was sent to ${users[0].email} and ${users[1].email}`,
      });
      setSuccess(true);
      console.log("Email sent successfully:", data);
      
    } catch (error: any) {
      console.error("Error sending test email:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setErrorDetails(errorMessage);
      
      // Store stack trace if available
      if (error instanceof Error && error.stack) {
        setErrorTrace(error.stack);
      }
      
      toast({
        title: "Failed to Send Email",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRetryConnection = () => {
    setRetryCount(prev => prev + 1);
    setErrorDetails("Retrying Supabase connection...");
    toast({
      title: "Retrying Connection",
      description: "Attempting to reconnect to Supabase...",
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
          
          {!isSupabaseReady ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="flex items-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                <span>Initializing Supabase connection...</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryConnection}
                className="mt-2"
              >
                <RefreshCcw className="h-4 w-4 mr-1" />
                Retry Connection
              </Button>
            </div>
          ) : isLoadingUsers ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length < 2 ? (
            <div className="text-amber-500 text-sm p-4 bg-amber-50 rounded-md">
              You need at least two users in your system to test this feature.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="font-medium">Recipients:</p>
                <ul className="text-sm mt-1">
                  {users.slice(0, 2).map(user => (
                    <li key={user.id}>{user.name} ({user.email})</li>
                  ))}
                </ul>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="font-medium">Test Data:</p>
                <ul className="text-sm mt-1">
                  <li>Date: Current month and year</li>
                  <li>Settlement Amount: £25.13</li>
                  <li>Settlement Direction: User 1 → User 2</li>
                  <li>Attachments: PDF Report, CSV Export</li>
                </ul>
              </div>
            </div>
          )}
          
          {errorDetails && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Error details:</p>
                  <p className="mt-1">{errorDetails}</p>
                  
                  {errorTrace && (
                    <div className="mt-2">
                      <p className="font-semibold">Debug information:</p>
                      <pre className="mt-1 text-xs overflow-auto max-h-32 p-2 bg-red-100 rounded">
                        {errorTrace}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestEmail;
