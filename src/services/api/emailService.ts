
import { supabase } from "@/integrations/supabase/client";
import { User, MonthData, Expense } from "@/types";
import { generateSettlementReportPDF } from "../export/exportService";

// Send settlement email to both users
export const sendSettlementEmail = async (
  monthData: MonthData,
  year: number,
  month: number,
  users: User[]
): Promise<void> => {
  try {
    if (users.length < 2) {
      throw new Error("Need at least two users to send settlement emails");
    }

    const user1 = users[0];
    const user2 = users[1];
    
    // Generate PDF report
    const pdfReport = generateSettlementReportPDF(
      {
        totalExpenses: monthData.totalExpenses,
        user1Paid: monthData.user1Paid,
        user2Paid: monthData.user2Paid,
        settlement: monthData.settlement,
        settlementDirection: monthData.settlementDirection
      },
      year,
      month,
      user1.name,
      user2.name
    );

    // Create FormData to send the PDF
    const formData = new FormData();
    formData.append("year", year.toString());
    formData.append("month", month.toString());
    formData.append("user1", user1.id);
    formData.append("user2", user2.id);
    formData.append("settlementAmount", monthData.settlement.toString());
    formData.append("settlementDirection", monthData.settlementDirection);
    formData.append("reportPdf", pdfReport, `settlement_${year}_${month}.pdf`);

    // Call Supabase Edge Function to send the email
    const { data, error } = await supabase.functions.invoke("send-settlement-email", {
      body: formData
    });

    if (error) {
      throw error;
    }

    console.log("Settlement email sent successfully", data);
    return data;
  } catch (error) {
    console.error("Error sending settlement email:", error);
    throw error;
  }
};
