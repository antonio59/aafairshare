
import { Expense } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Export data to CSV
export const exportToCSV = (data: Expense[], year: number, month: number): string => {
  // Create CSV header
  const headers = ['Date', 'Category', 'Location', 'Description', 'Amount', 'Paid By', 'Split'];
  
  // Format data rows
  const rows = data.map(expense => [
    expense.date,
    expense.category,
    expense.location,
    expense.description,
    expense.amount.toString(),
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
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Expense Report - ${monthName} ${year}`, 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Calculate total
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Summary section
    doc.setFontSize(13);
    doc.text('Summary:', 14, 40);
    doc.setFontSize(11);
    doc.text(`Total Expenses: £${total.toFixed(2)}`, 14, 48);
    doc.text(`Total Items: ${expenses.length}`, 14, 54);
    
    // Prepare data for table
    const tableColumn = ['Date', 'Category', 'Location', 'Description', 'Amount', 'Paid By'];
    const tableRows = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.category,
      expense.location,
      expense.description || '-',
      `£${expense.amount.toFixed(2)}`,
      expense.paidBy === "1" ? "User1" : "User2"
    ]);
    
    // Add table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'striped',
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255
      },
      margin: { top: 10 }
    });
    
    // Save the PDF
    doc.save(`expenses_${monthName}_${year}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
