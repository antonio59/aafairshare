
import { Expense } from "@/types";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Export data to CSV
export const exportToCSV = (data: Expense[], year: number, month: number): string => {
  // Create CSV header with all fields
  const headers = ['Date', 'Category', 'Location', 'Description', 'Amount', 'Paid By', 'Split Type'];
  
  // Format data rows
  const rows = data.map(expense => [
    expense.date,
    expense.category,
    expense.location,
    expense.description || '',
    expense.amount.toFixed(2), // Ensure two decimal places
    expense.paidBy === "1" ? "User1" : "User2",
    expense.split
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

// Download as CSV
export const downloadCSV = (expenses: Expense[], year: number, month: number): void => {
  const csvContent = exportToCSV(expenses, year, month);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_${monthName}_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate and download PDF
export const downloadPDF = (expenses: Expense[], year: number, month: number): void => {
  try {
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    const doc = new jsPDF();
    
    // Add branding
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFont("helvetica", "bold");
    doc.text("AAFairShare", 14, 20);
    
    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`Expense Report - ${monthName} ${year}`, 14, 30);
    
    // Add horizontal line
    doc.setDrawColor(0);
    doc.line(14, 35, doc.internal.pageSize.width - 14, 35);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 45);
    
    // Calculate total
    const total = parseFloat(expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2));
    
    // Summary section
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text('Summary:', 14, 55);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Total Expenses: £${total.toFixed(2)}`, 14, 63);
    doc.text(`Total Items: ${expenses.length}`, 14, 70);
    
    // Prepare data for table
    const tableColumn = ['Date', 'Category', 'Location', 'Description', 'Amount', 'Paid By', 'Split Type'];
    const tableRows = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.category,
      expense.location,
      expense.description || '-',
      `£${expense.amount.toFixed(2)}`, // Ensure two decimal places
      expense.paidBy === "1" ? "User1" : "User2",
      expense.split
    ]);
    
    // Add table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'plain',
      headStyles: {
        fillColor: [255, 255, 255], // White background
        textColor: [0, 0, 0], // Black text
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      styles: {
        textColor: [0, 0, 0], // Black text
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Date
        1: { cellWidth: 25 }, // Category
        2: { cellWidth: 25 }, // Location
        3: { cellWidth: 40 }, // Description
        4: { cellWidth: 20 }, // Amount
        5: { cellWidth: 20 }, // Paid By
        6: { cellWidth: 20 }  // Split Type
      },
      margin: { top: 10 },
      alternateRowStyles: {
        fillColor: [240, 240, 240] // Light gray for alternate rows
      }
    });
    
    // Add footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128); // Gray text
      doc.text('The AAFairShare Team', 14, doc.internal.pageSize.height - 10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`expenses_${monthName}_${year}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

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
