
import { User } from "@/types";
import { getSupabase } from "@/integrations/supabase/client";
import { generateSettlementReportPDF } from "@/services/export/settlementReportService";
import { exportToCSV } from "@/services/export/csvExportService";

interface EmailSendingResult {
  success: boolean;
  message?: string;
  errorMessage?: string;
  errorTrace?: string;
}

export class EmailSendingService {
  // Function to check Supabase functions availability
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

  // Generate test data for the email
  static generateTestData(users: User[]) {
    const testYear = new Date().getFullYear();
    const testMonth = new Date().getMonth() + 1;
    
    // Create sample data with correct expense format
    const sampleExpenses = [
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
    
    const testData = {
      testYear,
      testMonth,
      sampleMonthData: {
        totalExpenses: 350.75,
        user1Paid: 200.50,
        user2Paid: 150.25,
        settlement: 25.125,
        settlementDirection: "owes" as const,
        expenses: sampleExpenses
      }
    };
    
    return testData;
  }

  // Prepare form data for the email
  static async prepareFormData(users: User[]) {
    const { testYear, testMonth, sampleMonthData } = this.generateTestData(users);
    
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
    
    return {
      formData,
      testData: {
        year: testYear,
        month: testMonth
      }
    };
  }

  // Send test email to users
  static async sendTestEmail(users: User[]): Promise<EmailSendingResult> {
    try {
      if (users.length < 2) {
        return {
          success: false,
          errorMessage: "Need at least two users to send test email"
        };
      }

      // Check if the function is available first
      const isAvailable = await this.checkFunctionAvailability();
      if (!isAvailable) {
        throw new Error("Edge function appears to be unavailable. Please try again later or check your Supabase deployment.");
      }
      
      // Prepare form data
      const { formData } = await this.prepareFormData(users);
      
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

      console.log("Email sent successfully:", data);
      return {
        success: true,
        message: `Test settlement email was sent to ${users[0].email} and ${users[1].email}`
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
