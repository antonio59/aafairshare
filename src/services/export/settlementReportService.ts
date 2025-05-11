
import { User } from "@/types";
import { jsPDF } from "jspdf";

// Generate settlement report PDF
export const generateSettlementReportPDF = (
  monthData: {
    totalExpenses: number;
    user1Paid: number;
    user2Paid: number;
    settlement: number;
    settlementDirection: 'owes' | 'owed' | 'even';
  },
  year: number,
  month: number,
  user1Name: string,
  user2Name: string
): Blob => {
  try {
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    const monthString = `${year}-${month.toString().padStart(2, '0')}`;
    const doc = new jsPDF();
    
    // Add branding
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFont("helvetica", "bold");
    doc.text("AAFairShare", 14, 20);
    
    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`Settlement Report - ${monthName} ${year}`, 14, 30);
    
    // Add horizontal line
    doc.setDrawColor(0);
    doc.line(14, 35, doc.internal.pageSize.width - 14, 35);
    
    // Greeting
    doc.setFontSize(12);
    doc.text(`Hi ${user1Name} and ${user2Name},`, 14, 45);
    
    doc.text(`Here's the settlement summary for ${monthString}:`, 14, 55);
    
    // Create a light gray background box for the summary
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 60, 180, 50, 'F');
    
    // Summary content
    doc.setFontSize(12);
    doc.text(`${user1Name} Paid: £${monthData.user1Paid.toFixed(2)}`, 20, 70);
    doc.text(`${user2Name} Paid: £${monthData.user2Paid.toFixed(2)}`, 20, 80);
    doc.text(`Total Expenses: £${monthData.totalExpenses.toFixed(2)}`, 20, 90);
    
    // Add horizontal separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 100, 180, 100);
    
    // Settlement details
    doc.setFont("helvetica", "bold");
    doc.text("Settlement:", 20, 110);
    
    if (monthData.settlementDirection === 'owes') {
      doc.text(`${user1Name} paid ${user2Name} £${monthData.settlement.toFixed(2)}`, 70, 110);
    } else if (monthData.settlementDirection === 'owed') {
      doc.text(`${user2Name} paid ${user1Name} £${monthData.settlement.toFixed(2)}`, 70, 110);
    } else {
      doc.text(`No payment needed - expenses already balanced`, 70, 110);
    }
    
    // Add note about the reports
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Please find the detailed CSV and PDF reports attached.", 14, 130);
    
    // Add signature
    doc.text("Thanks,", 14, 150);
    doc.text("The AAFairShare Team", 14, 160);
    
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error("Error generating settlement report PDF:", error);
    throw error;
  }
};
