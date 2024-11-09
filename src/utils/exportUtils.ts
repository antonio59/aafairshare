import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import type { Expense, Category, Tag } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface MonthlyTotals {
  andresPaid: number;
  antonioPaid: number;
  andresShare: number;
  antonioShare: number;
  total: number;
}

const calculateMonthlyTotals = (expenses: Expense[]): MonthlyTotals => {
  return expenses.reduce((acc, expense) => {
    const amount = expense.amount;
    if (expense.paidBy === 'Andres') {
      acc.andresPaid += amount;
      if (expense.split === 'equal') {
        acc.andresShare += amount / 2;
        acc.antonioShare += amount / 2;
      } else {
        acc.andresShare += amount;
      }
    } else {
      acc.antonioPaid += amount;
      if (expense.split === 'equal') {
        acc.andresShare += amount / 2;
        acc.antonioShare += amount / 2;
      } else {
        acc.antonioShare += amount;
      }
    }
    acc.total += amount;
    return acc;
  }, {
    andresPaid: 0,
    antonioPaid: 0,
    andresShare: 0,
    antonioShare: 0,
    total: 0
  });
};

export const exportToExcel = async (
  expenses: Expense[],
  categories: Category[],
  tags: Tag[],
  month: string
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expenses');

  // Set up columns
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Paid By', key: 'paidBy', width: 15 },
    { header: 'Split', key: 'split', width: 15 },
    { header: 'Tags', key: 'tags', width: 30 }
  ];

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add expense data
  expenses.forEach(expense => {
    const category = categories.find(c => c?.id === expense.category);
    const expenseTags = expense.tags?.map(tagId => 
      tags.find(t => t.id === tagId)?.name
    ).filter(Boolean).join(', ');

    worksheet.addRow({
      date: format(new Date(expense.date), 'MMM d, yyyy'),
      category: category?.name || '',
      description: expense.description || '',
      amount: expense.amount,
      paidBy: expense.paidBy,
      split: expense.split === 'equal' ? 'Equal Split' : 'No Split',
      tags: expenseTags || ''
    });
  });

  // Format amount column
  worksheet.getColumn('amount').numFmt = '£#,##0.00';

  // Calculate totals
  const totals = calculateMonthlyTotals(expenses);

  // Add empty row
  worksheet.addRow([]);

  // Add summary section
  const summaryStartRow = worksheet.rowCount + 1;
  worksheet.getCell(`A${summaryStartRow}`).value = 'Monthly Summary';
  worksheet.getCell(`A${summaryStartRow}`).font = { bold: true };

  worksheet.addRow(['Andres paid:', totals.andresPaid]);
  worksheet.addRow(['Antonio paid:', totals.antonioPaid]);
  worksheet.addRow(['Andres share:', totals.andresShare]);
  worksheet.addRow(['Antonio share:', totals.antonioShare]);
  worksheet.addRow(['Total:', totals.total]);

  // Format summary amounts
  for (let i = 0; i < 5; i++) {
    worksheet.getCell(`B${summaryStartRow + i + 1}`).numFmt = '£#,##0.00';
  }

  // Add empty row
  worksheet.addRow([]);

  // Add balance
  const balanceText = totals.andresPaid > totals.andresShare
    ? `Antonio owes Andres £${(totals.andresPaid - totals.andresShare).toFixed(2)}`
    : `Andres owes Antonio £${(totals.antonioShare - totals.antonioPaid).toFixed(2)}`;
  worksheet.addRow([balanceText]);

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Create blob and download
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const monthName = format(new Date(month + '-01'), 'MMMM yyyy');
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `Expenses_${monthName}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = (
  expenses: Expense[],
  categories: Category[],
  tags: Tag[],
  month: string
) => {
  const doc = new jsPDF();
  const monthName = format(new Date(month + '-01'), 'MMMM yyyy');

  // Add title
  doc.setFontSize(16);
  doc.text(`Expenses - ${monthName}`, 14, 15);

  // Prepare data for table
  const tableData = expenses.map(expense => {
    const category = categories.find(c => c?.id === expense.category);
    const expenseTags = expense.tags?.map(tagId => 
      tags.find(t => t.id === tagId)?.name
    ).filter(Boolean).join(', ');

    return [
      format(new Date(expense.date), 'MMM d, yyyy'),
      category?.name || '',
      expense.description || '',
      `£${expense.amount.toFixed(2)}`,
      expense.paidBy,
      expense.split === 'equal' ? 'Equal Split' : 'No Split',
      expenseTags || ''
    ];
  });

  // Add expenses table
  (doc as any).autoTable({
    startY: 25,
    head: [['Date', 'Category', 'Description', 'Amount', 'Paid By', 'Split', 'Tags']],
    body: tableData,
    styles: {
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Date
      1: { cellWidth: 25 }, // Category
      2: { cellWidth: 35 }, // Description
      3: { cellWidth: 20 }, // Amount
      4: { cellWidth: 20 }, // Paid By
      5: { cellWidth: 20 }, // Split
      6: { cellWidth: 40 }  // Tags
    }
  });

  // Calculate totals
  const totals = calculateMonthlyTotals(expenses);

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 25;
  doc.setFontSize(12);
  doc.text('Monthly Summary', 14, finalY + 15);

  const summaryData = [
    ['Andres paid:', `£${totals.andresPaid.toFixed(2)}`],
    ['Antonio paid:', `£${totals.antonioPaid.toFixed(2)}`],
    ['Andres share:', `£${totals.andresShare.toFixed(2)}`],
    ['Antonio share:', `£${totals.antonioShare.toFixed(2)}`],
    ['Total:', `£${totals.total.toFixed(2)}`],
  ];

  (doc as any).autoTable({
    startY: finalY + 20,
    body: summaryData,
    theme: 'plain',
    styles: {
      fontSize: 10
    }
  });

  // Add balance
  const balanceText = totals.andresPaid > totals.andresShare
    ? `Antonio owes Andres £${(totals.andresPaid - totals.andresShare).toFixed(2)}`
    : `Andres owes Antonio £${(totals.antonioShare - totals.antonioPaid).toFixed(2)}`;

  doc.setFontSize(12);
  doc.text(balanceText, 14, (doc as any).lastAutoTable.finalY + 15);

  // Save file
  doc.save(`Expenses_${monthName}.pdf`);
};
