import { utils, writeFile } from 'xlsx';
import { ExpenseWithDetails, SettlementWithUsers, MonthSummary } from '@shared/schema';
import { formatCurrency, formatDate, formatMonthYear } from './utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Extend jsPDF with lastAutoTable property that exists after autoTable is called
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY?: number;
    };
  }
}
import { USERS } from './constants';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  month: string;
  expenses: ExpenseWithDetails[];
  settlements?: SettlementWithUsers[];
  summary?: MonthSummary;
}

export const exportExpenses = ({ format, month, expenses, settlements = [], summary }: ExportOptions) => {
  // Calculate the total amount of expenses
  const totalAmount = expenses.reduce((total, expense) => total + Number(expense.amount), 0);

  // Format expenses for display
  const formattedExpenses = expenses.map(expense => ({
    'Date': formatDate(expense.date),
    'Category': expense.category.name,
    'Location': expense.location.name,
    'Amount': formatCurrency(Number(expense.amount)),
    'Paid By': expense.paidByUser.username,
    'Split': expense.split_type,
    'Description': expense.description || ''
  }));

  // Add a total row
  const totalRow = {
    'Date': '',
    'Category': '',
    'Location': 'TOTAL',
    'Amount': formatCurrency(totalAmount),
    'Paid By': '',
    'Split': '',
    'Description': ''
  };

  // Format settlements data if available
  const formattedSettlements = settlements.map(settlement => ({
    'Date': formatDate(settlement.date),
    'Month': formatMonthYear(settlement.month),
    'From': settlement.fromUser.username,
    'To': settlement.toUser.username,
    'Amount': formatCurrency(Number(settlement.amount))
  }));

  // Get properly formatted settlement status using user names
  let settlementStatus = "No settlement information available";

  if (summary && summary.settlementAmount > 0) {
    const fromUserId = summary.settlementDirection.fromUserId;
    const toUserId = summary.settlementDirection.toUserId;

    // Get user names from the user IDs
    const fromUser = USERS.find(user => user.id === fromUserId);
    const toUser = USERS.find(user => user.id === toUserId);

    const fromUserName = fromUser?.name || `User ${fromUserId}`;
    const toUserName = toUser?.name || `User ${toUserId}`;

    settlementStatus = `${fromUserName} owes ${formatCurrency(summary.settlementAmount)} to ${toUserName}`;
  } else if (summary) {
    settlementStatus = "No settlements needed";
  }

  const fileName = `expenses-${month}`;

  if (format === 'csv' || format === 'xlsx') {
    // Create expenses worksheet with total
    const expensesWithTotal = [...formattedExpenses, totalRow];
    const worksheet = utils.json_to_sheet(expensesWithTotal);

    // Adjust column widths
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 15 }, // Category
      { wch: 15 }, // Location
      { wch: 10 }, // Amount
      { wch: 12 }, // Paid By
      { wch: 10 }, // Split
      { wch: 30 }  // Description
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Expenses');

    // Add settlements sheet if there are any
    if (settlements.length > 0) {
      const settlementSheet = utils.json_to_sheet(formattedSettlements);

      // Adjust column widths for settlements
      const settlementColumnWidths = [
        { wch: 12 }, // Date
        { wch: 15 }, // Month
        { wch: 12 }, // From
        { wch: 12 }, // To
        { wch: 10 }  // Amount
      ];
      settlementSheet['!cols'] = settlementColumnWidths;

      utils.book_append_sheet(workbook, settlementSheet, 'Settlements');
    }

    // Add summary information sheet
    if (summary) {
      // Create a more detailed summary sheet with user expense info
      const user1 = USERS[0];
      const user2 = USERS[1];

      const user1Expenses = summary.userExpenses[user1.id] || 0;
      const user2Expenses = summary.userExpenses[user2.id] || 0;

      const summaryData = [
        { 'Item': 'Total Expenses', 'Value': formatCurrency(summary.totalExpenses) },
        { 'Item': `${user1.name} Paid`, 'Value': formatCurrency(user1Expenses) },
        { 'Item': `${user2.name} Paid`, 'Value': formatCurrency(user2Expenses) },
        { 'Item': 'Settlement Status', 'Value': settlementStatus }
      ];

      const summarySheet = utils.json_to_sheet(summaryData);
      utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    writeFile(workbook, `${fileName}.${format}`);
  } else if (format === 'pdf') {
    let doc: jsPDF;
    try {
      doc = new jsPDF();

      // Add title and header info
      doc.setFontSize(16);
      doc.text(`Expenses for ${formatMonthYear(month)}`, 14, 15);

      doc.setFontSize(10);
      doc.text(`Generated: ${formatDate(new Date())}`, 14, 22);

      // Add settlement status if available
      if (summary) {
        doc.setFontSize(10);
        doc.text(`Settlement Status: ${settlementStatus}`, 14, 28);
      }

      // Add expenses table with proper formatting
      autoTable(doc, {
        head: [['Date', 'Category', 'Location', 'Amount', 'Paid By', 'Split', 'Description']],
        body: [
          ...expenses.map(expense => [
            formatDate(expense.date),
            expense.category.name,
            expense.location.name,
            formatCurrency(Number(expense.amount)),
            expense.paidByUser.username,
            expense.split_type,
            expense.description || ''
          ]),
          // Add total row with bold formatting
          ['', '', 'TOTAL', formatCurrency(totalAmount), '', '', '']
        ],
        startY: 32,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
        columns: [
          { dataKey: 'date' },
          { dataKey: 'category' },
          { dataKey: 'location' },
          { dataKey: 'amount' },
          { dataKey: 'paidBy' },
          { dataKey: 'split' },
          { dataKey: 'description' }
        ],
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 'auto' }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        // Add bottom row styling for total
        foot: [['', '', 'TOTAL', formatCurrency(totalAmount), '', '', '']],
        footStyles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
      });

      // Get the last Y position after expenses table
      const finalY = doc.lastAutoTable.finalY || 150;

      // Add user expense breakdown if summary is available
      if (summary) {
        const user1 = USERS[0];
        const user2 = USERS[1];

        const user1Expenses = summary.userExpenses[user1.id] || 0;
        const user2Expenses = summary.userExpenses[user2.id] || 0;

        doc.setFontSize(14);
        doc.text('Expense Summary', 14, finalY + 15);

        autoTable(doc, {
          head: [['User', 'Amount', 'Percentage']],
          body: [
            [user1.name, formatCurrency(user1Expenses), '50%'],
            [user2.name, formatCurrency(user2Expenses), '50%'],
            ['Total', formatCurrency(summary.totalExpenses), '100%']
          ],
          startY: finalY + 20,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] },
          footStyles: { fontStyle: 'bold', fillColor: [255, 255, 255] }
        });
      }

      // Add settlement information if available
      if (settlements.length > 0) {
        // Get the current Y position
        const summaryY = doc.lastAutoTable.finalY || finalY + 40;

        doc.setFontSize(14);
        doc.text('Settlement History', 14, summaryY + 15);

        autoTable(doc, {
          head: [['Date', 'Month', 'From', 'To', 'Amount']],
          body: settlements.map(settlement => [
            formatDate(settlement.date),
            formatMonthYear(settlement.month),
            settlement.fromUser.username,
            settlement.toUser.username,
            formatCurrency(Number(settlement.amount))
          ]),
          startY: summaryY + 20,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] }
        });
      }

      // Save the PDF file
      doc.save(`${fileName}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      if (err instanceof Error) {
        if (err.message.includes('undefined')) {
          throw new Error("Missing data for PDF generation. Please check your data and try again.");
        }
        throw new Error(err.message || "Failed to generate PDF. Please try again.");
      }
      throw new Error("An unexpected error occurred while generating PDF.");
    }
  }
};