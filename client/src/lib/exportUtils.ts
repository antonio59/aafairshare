import { utils, writeFile } from 'xlsx';
import { ExpenseWithDetails } from '@shared/schema';
import { formatCurrency, formatDate } from './utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  month: string;
  expenses: ExpenseWithDetails[];
}

export const exportExpenses = ({ format, month, expenses }: ExportOptions) => {
  const formattedExpenses = expenses.map(expense => ({
    'Date': formatDate(expense.date),
    'Category': expense.category.name,
    'Location': expense.location.name,
    'Amount': formatCurrency(Number(expense.amount)),
    'Paid By': expense.paidByUser.username,
    'Split': expense.split_type,
    'Notes': expense.notes || ''
  }));

  const fileName = `expenses-${month}`;

  if (format === 'csv' || format === 'xlsx') {
    const worksheet = utils.json_to_sheet(formattedExpenses);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Expenses');
    
    writeFile(workbook, `${fileName}.${format}`);
  } else if (format === 'pdf') {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(`Expenses for ${month}`, 14, 15);
    
    // Add table
    (doc as any).autoTable({
      head: [['Date', 'Category', 'Location', 'Amount', 'Paid By', 'Split', 'Notes']],
      body: formattedExpenses.map(expense => [
        expense.Date,
        expense.Category,
        expense.Location,
        expense.Amount,
        expense['Paid By'],
        expense.Split,
        expense.Notes
      ]),
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save(`${fileName}.pdf`);
  }
};
