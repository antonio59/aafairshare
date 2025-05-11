
import { useState } from "react";
import { User, Expense } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSupabase } from "@/integrations/supabase/client";
import { generateSettlementReportPDF } from "@/services/export/settlementReportService";
import { exportToCSV } from "@/services/export/csvExportService";

interface EmailFormProps {
  users: User[];
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
  isSupabaseReady,
  isSending,
  isLoadingUsers,
  success,
  onSuccess,
  onError,
  onSendStart,
}: EmailFormProps) => {
  const { toast } = useToast();

  // Function to check Supabase functions availability
  const checkFunctionAvailability = async () => {
    try {
      const supabase = await getSupabase();
      
      // Just make a simple OPTIONS request to check if the function is available
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
  };

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
      // Check if the function is available first
      const isAvailable = await checkFunctionAvailability();
      if (!isAvailable) {
        throw new Error("Edge function appears to be unavailable. Please try again later or check your Supabase deployment.");
      }
      
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
        settlementDirection: "owes" as const,
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

      toast({
        title: "Email Sent Successfully",
        description: `Test settlement email was sent to ${(users[0] as any).email} and ${(users[1] as any).email}`,
      });
      onSuccess();
      console.log("Email sent successfully:", data);
      
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
