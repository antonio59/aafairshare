import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { createBrowserClient } from '@supabase/ssr';

interface Expense {
  id: string;
  amount: number;
  category_id: string;
  location_id: string;
  notes: string;
  date: string;
  paid_by: string;
  split_type: 'Equal' | 'No Split';
  users: {
    name: string;
  }
  created_at: string;
}



interface Settlement {
  from: string;
  to: string;
  amount: number;
}

const getSupabaseData = async () => {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {});
  const { data: categories } = await supabase.from('categories').select('id, category');
  const { data: locations } = await supabase.from('locations').select('id, location');

  return {
    categoryMap: new Map(categories?.map((c: { id: string; category: string }) => [c.id, c.category]) || []),
    locationMap: new Map(locations?.map((l: { id: string; location: string }) => [l.id, l.location]) || [])
  };
};

const recordExport = async (params: {
  format: 'csv' | 'pdf';
  month: string;
  fileName: string;
  fileData: string;
}) => {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {});
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from('exports').insert({
    user_id: user?.id,
    data_type: 'expenses',
    format: params.format,
    filters: { month: params.month },
    file_name: params.fileName,
    file_data: params.fileData,
  });
};

export const exportToCSV = async (expenses: Expense[], month: string) => {
  const { categoryMap, locationMap } = await getSupabaseData();

  const headers = ['Date', 'Amount', 'Category', 'Location', 'Notes', 'Paid By', 'Split Type'];
  const rows = expenses.map(expense => [
    new Date(expense.date).toLocaleDateString('en-GB'),
    `£${expense.amount.toFixed(2)}`,
    categoryMap.get(expense.category_id) || 'Unknown',
    locationMap.get(expense.location_id) || 'Unknown',
    expense.notes,
    expense.users.name,
    expense.split_type
  ]);

  // Calculate totals and settlements
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const userExpenses = new Map();
  expenses.forEach(exp => {
    const amount = exp.split_type === 'Equal' ? exp.amount / 2 : exp.amount;
    userExpenses.set(exp.users.name, (userExpenses.get(exp.users.name) || 0) + amount);
  });

  // Add empty row and summary section
  rows.push([]);
  rows.push(['Summary']);
  rows.push(['Total Expenses', `£${total.toFixed(2)}`]);
  rows.push([]);
  rows.push(['Settlements']);
  for (const [user, amount] of userExpenses.entries()) {
    rows.push([user, `£${amount.toFixed(2)}`]);
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8-sig' });
  const fileName = `expenses-${month}.csv`;
  
  await recordExport({
    format: 'csv',
    month,
    fileName,
    fileData: csvContent
  });

  return { blob, fileName };
};

export const exportToPDF = async (expenses: Expense[], month: string, totalExpenses: number, settlement?: Settlement) => {
  const doc = new jsPDF();
  const { categoryMap, locationMap } = await getSupabaseData();
  const margin = 15;
  
  // Add header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const title = 'AAFairShare';
  doc.text(title, doc.internal.pageSize.width / 2, margin, { align: 'center' });
  
  // Add report title and month
  doc.setFontSize(16);
  doc.text('Monthly Expense Summary', margin, margin + 15);
  
  // Add month and total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const monthDate = new Date(month + '-01');
  const monthText = `Month: ${monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;  const totalText = `Total: £${totalExpenses.toFixed(2)}`;
  
  doc.text(monthText, margin, margin + 25);
  doc.text(totalText, doc.internal.pageSize.width - margin, margin + 25, { align: 'right' });

  // Add expenses table
  const tableHeaders = [['Date', 'Category', 'Location', 'Amount', 'Split Type', 'Notes']];
  const tableData = expenses.map(expense => [
    new Date(expense.date).toLocaleDateString(),
    categoryMap.get(expense.category_id) || 'Unknown',
    locationMap.get(expense.location_id) || 'Unknown',
    `£${expense.amount.toFixed(2)}`,
    expense.split_type,
    expense.notes || ''
  ]);

  doc.autoTable({
    head: tableHeaders,
    body: tableData,
    startY: margin + 35,
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 25 },  // Date
      1: { cellWidth: 35 },  // Category
      2: { cellWidth: 35 },  // Location
      3: { cellWidth: 25 },  // Amount
      4: { cellWidth: 25 },  // Split Type
      5: { cellWidth: 'auto' } // Notes
    },
    margin: { left: margin, right: margin }
  });

  // Add settlement information if available
  if (settlement) {
    const finalY = doc.lastAutoTable.finalY || (margin + 35);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Settlement Summary', margin, finalY + 10);
    
    doc.setFont('helvetica', 'normal');
    const settlementText = `${settlement.from} owes ${settlement.to} £${settlement.amount.toFixed(2)}`;
    doc.text(settlementText, margin, finalY + 20);
  }

  const fileName = `expenses-${month}.pdf`;
  const pdfOutput = doc.output('arraybuffer');
  const pdfBuffer = Buffer.from(pdfOutput);

  await recordExport({
    format: 'pdf',
    month,
    fileName,
    fileData: pdfBuffer.toString('base64')
  });

  doc.save(fileName);
  return { buffer: pdfBuffer, fileName };
};