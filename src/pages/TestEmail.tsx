
import { useState } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/services/api/userService";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSettlementReportPDF } from "@/services/export/settlementReportService";
import { exportToCSV } from "@/services/export/csvExportService";

const TestEmail = () => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

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

    try {
      // Generate sample data
      const testYear = new Date().getFullYear();
      const testMonth = new Date().getMonth() + 1;
      
      // Create sample data
      const sampleMonthData = {
        totalExpenses: 350.75,
        user1Paid: 200.50,
        user2Paid: 150.25,
        settlement: 25.125,
        settlementDirection: "owes",
        expenses: [
          {
            id: "test-1",
            description: "Groceries",
            amount: 85.25,
            date: new Date().toISOString(),
            paid_by_id: users[0].id,
            split_type: "50/50"
          },
          {
            id: "test-2",
            description: "Dinner",
            amount: 65.50,
            date: new Date().toISOString(),
            paid_by_id: users[1].id,
            split_type: "50/50"
          }
        ]
      };
      
      // Generate PDF report
      const pdfReport = generateSettlementReportPDF(
        sampleMonthData,
        testYear,
        testMonth,
        users[0].name,
        users[1].name
      );
      
      // Generate CSV report
      const csvContent = exportToCSV(sampleMonthData.expenses, testYear, testMonth);
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

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("send-settlement-email", {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email Sent Successfully",
        description: `Test settlement email was sent to ${users[0].email} and ${users[1].email}`,
      });
      setSuccess(true);
      console.log("Email sent successfully:", data);
      
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Failed to Send Email",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
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
          
          {isLoadingUsers ? (
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
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSendTest} 
            disabled={isSending || isLoadingUsers || users.length < 2}
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
