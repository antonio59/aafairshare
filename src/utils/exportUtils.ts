import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { Expense, Category, Tag } from '../types';

// Branding constants
const BRAND_COLORS = {
  primary: '#3B82F6', // Blue
  secondary: '#1E40AF', // Darker blue
  text: '#1F2937', // Dark gray
  border: '#E5E7EB', // Light gray
};

// Use standard PDF fonts
const BRAND_FONTS = {
  regular: 'helvetica',
  bold: 'helvetica',
  boldStyle: 'bold',
};

interface ExportOptions {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  showFooter?: boolean;
  isSettled?: boolean;
  settledBy?: string;
  settledDate?: string;
  splitTotals?: Record<string, number>;
}

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return `£${amount.toFixed(2)}`;
};

// Helper to format dates consistently
const formatDate = (date: string): string => {
  return format(new Date(date), 'dd/MM/yyyy');
};

// Create header with branding
const createHeader = (doc: jsPDF, title: string, subtitle?: string, options?: ExportOptions) => {
  // Add title
  doc.setFont(BRAND_FONTS.regular, BRAND_FONTS.boldStyle);
  doc.setFontSize(20);
  doc.setTextColor(BRAND_COLORS.primary);
  doc.text('AA FairShare', 20, 20);

  doc.setFont(BRAND_FONTS.regular, BRAND_FONTS.boldStyle);
  doc.setFontSize(16);
  doc.setTextColor(BRAND_COLORS.text);
  doc.text(title, 20, 35);

  if (subtitle) {
    doc.setFont(BRAND_FONTS.regular);
    doc.setFontSize(12);
    doc.text(subtitle, 20, 45);
  }

  // Add settlement status
  doc.setFont(BRAND_FONTS.regular);
  doc.setFontSize(10);
  doc.setTextColor(BRAND_COLORS.secondary);
  doc.text(
    options?.isSettled
      ? `Settled by ${options.settledBy} on ${options.settledDate}`
      : 'Status: Unsettled',
    20, 55
  );

  // Add date
  doc.setFontSize(10);
  doc.setTextColor(BRAND_COLORS.text);
  doc.text(`Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 65);
};

// Create footer with page numbers
const createFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont(BRAND_FONTS.regular);
    doc.setFontSize(10);
    doc.setTextColor(BRAND_COLORS.text);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      'AA FairShare - Expense tracking made easy',
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }
};

export const exportToPDF = (
  expenses: Expense[],
  categories: Category[],
  tags: Tag[],
  options: ExportOptions
) => {
  const doc = new jsPDF();

  // Add header
  createHeader(doc, options.title, options.subtitle, options);

  // Prepare table data
  const tableData = expenses.map(expense => {
    const category = categories.find(c => c.id === expense.category)?.name || 'Uncategorized';
    const expenseTags = expense.tags
      ?.map(tagId => tags.find(t => t.id === tagId)?.name)
      .filter(Boolean)
      .join(', ') || '';

    return [
      formatDate(expense.date),
      category,
      expenseTags,
      expense.description || 'Untitled',
      formatCurrency(expense.amount),
      expense.split === 'equal' ? 'Equal Split' : 'No Split',
      expense.paidBy,
    ];
  });

  // Calculate totals
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Add table
  autoTable(doc, {
    startY: 75,
    head: [['Date', 'Category', 'Tags', 'Description', 'Amount', 'Split', 'Paid By']],
    body: tableData,
    foot: [['', '', '', 'Total', formatCurrency(total), '', '']],
    theme: 'grid',
    styles: {
      font: BRAND_FONTS.regular,
      textColor: BRAND_COLORS.text,
    },
    headStyles: {
      fillColor: BRAND_COLORS.primary,
      textColor: '#FFFFFF',
      fontStyle: 'bold',
    },
    footStyles: {
      fillColor: BRAND_COLORS.secondary,
      textColor: '#FFFFFF',
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: '#F9FAFB',
    },
  });

  // Add split totals if available
  if (options.splitTotals && Object.keys(options.splitTotals).length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 75;
    doc.setFont(BRAND_FONTS.regular, BRAND_FONTS.boldStyle);
    doc.setFontSize(12);
    doc.setTextColor(BRAND_COLORS.text);
    doc.text('Split Totals', 20, finalY + 20);

    const splitData = Object.entries(options.splitTotals).map(([splitType, amount]) => [
      splitType === 'equal' ? 'Equal Split' : 'No Split',
      formatCurrency(amount),
    ]);

    autoTable(doc, {
      startY: finalY + 25,
      head: [['Split Type', 'Amount']],
      body: splitData,
      theme: 'grid',
      styles: {
        font: BRAND_FONTS.regular,
        textColor: BRAND_COLORS.text,
      },
      headStyles: {
        fillColor: BRAND_COLORS.primary,
        textColor: '#FFFFFF',
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: '#F9FAFB',
      },
    });
  }

  // Add footer with page numbers
  if (options.showFooter) {
    createFooter(doc);
  }

  // Save the PDF
  doc.save(`expenses-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportToExcel = async (
  expenses: Expense[],
  categories: Category[],
  tags: Tag[],
  options: ExportOptions
) => {
  // Create workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AA FairShare';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Add worksheet
  const worksheet = workbook.addWorksheet('Expenses');

  // Add title and metadata
  worksheet.addRow(['AA FairShare - Expense Report']).font = { bold: true, size: 16 };
  worksheet.addRow([options.title]).font = { bold: true, size: 14 };
  if (options.subtitle) {
    worksheet.addRow([options.subtitle]);
  }
  worksheet.addRow([`Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}`]);
  worksheet.addRow([
    options.isSettled
      ? `Settled by ${options.settledBy} on ${options.settledDate}`
      : 'Status: Unsettled'
  ]);
  worksheet.addRow([]); // Empty row for spacing

  // Add headers
  const headers = ['Date', 'Category', 'Tags', 'Description', 'Amount', 'Split', 'Paid By'];
  const headerRow = worksheet.addRow(headers);

  // Style header row
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '3B82F6' }
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    cell.alignment = { horizontal: 'center' };
  });

  // Add expense data
  expenses.forEach(expense => {
    const category = categories.find(c => c.id === expense.category)?.name || 'Uncategorized';
    const expenseTags = expense.tags
      ?.map(tagId => tags.find(t => t.id === tagId)?.name)
      .filter(Boolean)
      .join(', ') || '';

    worksheet.addRow([
      formatDate(expense.date),
      category,
      expenseTags,
      expense.description || 'Untitled',
      expense.amount,
      expense.split === 'equal' ? 'Equal Split' : 'No Split',
      expense.paidBy,
    ]);
  });

  // Add total row
  worksheet.addRow([]); // Empty row for spacing
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalRow = worksheet.addRow(['', '', '', 'Total', total, '', '']);
  totalRow.getCell(5).font = { bold: true };

  // Add split totals if available
  if (options.splitTotals && Object.keys(options.splitTotals).length > 0) {
    worksheet.addRow([]); // Empty row for spacing
    worksheet.addRow(['Split Totals']).font = { bold: true };
    
    const splitHeaders = worksheet.addRow(['Split Type', 'Amount']);
    splitHeaders.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3B82F6' }
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFF' }
      };
    });

    Object.entries(options.splitTotals).forEach(([splitType, amount]) => {
      worksheet.addRow([
        splitType === 'equal' ? 'Equal Split' : 'No Split',
        amount
      ]);
    });
  }

  // Set column widths
  worksheet.columns = [
    { width: 12 }, // Date
    { width: 20 }, // Category
    { width: 30 }, // Tags
    { width: 30 }, // Description
    { width: 12 }, // Amount
    { width: 12 }, // Split
    { width: 12 }, // Paid By
  ];

  // Format amount column as currency
  worksheet.getColumn(5).numFmt = '£#,##0.00';

  // Generate Excel file and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
