import { format } from 'date-fns';
import type { Expense, Category, Tag } from '../types';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

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
  // Dynamically import Excel.js
  const { default: ExcelJS } = await import('exceljs');
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


export const exportToPDF = async (
  expenses: Expense[],
  categories: Category[],
  tags: Tag[],
  month: string
) => {
  // Dynamically import PDF dependencies
  const [{ default: pdfMake }, { default: pdfFonts }] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts')
  ]);

  // Initialize pdfmake with fonts
  interface PdfMakeVFS {
    vfs: Record<string, string>;
  }

  interface PdfFonts {
    pdfMake: PdfMakeVFS;
  }

  (pdfMake as { vfs: Record<string, string> }).vfs = (pdfFonts as PdfFonts).pdfMake.vfs;
  const monthName = format(new Date(month + '-01'), 'MMMM yyyy');

  // Prepare data for table
  const tableBody = expenses.map(expense => {
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

  // Calculate totals
  const totals = calculateMonthlyTotals(expenses);

  // Create document definition
  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: `Expenses - ${monthName}`, style: 'header' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', '*'],
          body: [
            ['Date', 'Category', 'Description', 'Amount', 'Paid By', 'Split', 'Tags'],
            ...tableBody
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: '\nMonthly Summary', style: 'subheader' },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Andres paid:', `£${totals.andresPaid.toFixed(2)}`],
            ['Antonio paid:', `£${totals.antonioPaid.toFixed(2)}`],
            ['Andres share:', `£${totals.andresShare.toFixed(2)}`],
            ['Antonio share:', `£${totals.antonioShare.toFixed(2)}`],
            ['Total:', `£${totals.total.toFixed(2)}`]
          ]
        },
        layout: 'noBorders'
      },
      {
        text: '\n' + (totals.andresPaid > totals.andresShare
          ? `Antonio owes Andres £${(totals.andresPaid - totals.andresShare).toFixed(2)}`
          : `Andres owes Antonio £${(totals.antonioShare - totals.antonioPaid).toFixed(2)}`),
        style: 'balance'
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 20, 0, 5]
      },
      balance: {
        fontSize: 12,
        bold: true,
        margin: [0, 8, 0, 0]
      }
    },
    defaultStyle: {
      fontSize: 10
    }
  };

  // Generate and download PDF
  const monthNameFile = format(new Date(month + '-01'), 'MMMM_yyyy');
  return pdfMake.createPdf(docDefinition).download(`Expenses_${monthNameFile}.pdf`);

};
