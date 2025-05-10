
import { Expense } from "@/types";

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
