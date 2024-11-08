import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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
    doc.setFont(BRAND_FONTS.regular, 'normal');
    doc.setFontSize(12);
    doc.text(subtitle, 20, 45);
  }

  // Add settlement status
  doc.setFont(BRAND_FONTS.regular, 'normal');
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
    doc.setFont(BRAND_FONTS.regular, 'normal');
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
      fontStyle: 'normal',
    },
    headStyles: {
      fillColor: BRAND_COLORS.primary,
      fontStyle: BRAND_FONTS.boldStyle,
      textColor: '#FFFFFF',
    },
    footStyles: {
      fillColor: BRAND_COLORS.secondary,
      fontStyle: BRAND_FONTS.boldStyle,
      textColor: '#FFFFFF',
    },
    alternateRowStyles: {
      fillColor: '#F9FAFB',
    },
  });

  // Add footer with page numbers
  if (options.showFooter) {
    createFooter(doc);
  }

  // Save the PDF
  doc.save(`expenses-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportToExcel = (
  expenses: Expense[],
  categories: Category[],
  tags: Tag[],
  options: ExportOptions
) => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Add title and metadata
  wb.Props = {
    Title: 'AA FairShare Expenses',
    Subject: options.title,
    Author: 'AA FairShare',
    CreatedDate: new Date(),
  };

  // Prepare data with header row
  const data = [
    ['AA FairShare - Expense Report'],
    [options.title],
    options.subtitle ? [options.subtitle] : [],
    [`Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}`],
    // Settlement status
    [options.isSettled
      ? `Settled by ${options.settledBy} on ${options.settledDate}`
      : 'Status: Unsettled'
    ],
  ];

  // Add empty row and headers
  data.push(
    [], // Empty row for spacing
    ['Date', 'Category', 'Tags', 'Description', 'Amount', 'Split', 'Paid By']
  );

  // Add expense data
  expenses.forEach(expense => {
    const category = categories.find(c => c.id === expense.category)?.name || 'Uncategorized';
    const expenseTags = expense.tags
      ?.map(tagId => tags.find(t => t.id === tagId)?.name)
      .filter(Boolean)
      .join(', ') || '';

    data.push([
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
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  data.push(
    [], // Empty row for spacing
    ['', '', '', 'Total', total, '', '']
  );

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // Date
    { wch: 20 }, // Category
    { wch: 30 }, // Tags
    { wch: 30 }, // Description
    { wch: 12 }, // Amount
    { wch: 12 }, // Split
    { wch: 12 }, // Paid By
  ];
  ws['!cols'] = colWidths;

  // Style the header
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "3B82F6" } },
    alignment: { horizontal: "center" },
  };

  // Apply styles (limited support in XLSX)
  const headerRange = XLSX.utils.decode_range('A7:G7');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 6, c: col });
    ws[cellRef].s = headerStyle;
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

  // Save the file
  XLSX.writeFile(wb, `expenses-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};