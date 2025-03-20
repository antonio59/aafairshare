import PDFDocument from 'pdfkit';
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

interface ExportData {
  expenses: Expense[];
  month: string;
  totalExpenses?: number;
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
  const doc = new PDFDocument({ size: 'A4' });
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 15;
  
  // Add simple text header
  doc.fontSize(24);
  doc.font('Helvetica-Bold');
  const title = 'AAFairShare';
  const titleWidth = doc.widthOfString(title);
  doc.text(title, (pageWidth - titleWidth) / 2, margin, { align: 'center', continued: false });
  
  // Add report title and month
  doc.fillColor('#212121');
  doc.fontSize(16);
  doc.text('Monthly Expense Summary', margin, margin + 30, { align: 'left', continued: false });
  
  // Add month and total in a cleaner format
  doc.fontSize(12);
  const monthDate = new Date(month + '-01');
  const monthText = `Month: ${monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
  const totalText = `Total: £${totalExpenses.toFixed(2)}`;
  
  doc.text(monthText, margin, margin + 50, { align: 'left', continued: false });
  doc.text(totalText, pageWidth - margin - doc.widthOfString(totalText), margin + 50, { align: 'right', continued: false });

  let y = 75;
  
  // Add settlement information if available
  if (settlement) {
    doc.fontSize(12);
    doc.font('Helvetica-Bold');
    doc.text('Settlement Summary', margin, margin + 70, { align: 'left', continued: false });
    
    doc.font('Helvetica');
    const settlementText = `${settlement.from} owes ${settlement.to} £${settlement.amount.toFixed(2)}`;
    doc.text(settlementText, margin, margin + 80, { align: 'left', continued: false });
    
    y = 95;
  }
  
  const { categoryMap, locationMap } = await getSupabaseData();
  
  // Create PDF buffer
  const chunks: Uint8Array[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  doc.end();

  const pdfBuffer = Buffer.concat(chunks);
  const fileName = `expenses-${month}.pdf`;

  await recordExport({
    format: 'pdf',
    month,
    fileName,
    fileData: pdfBuffer.toString('base64')
  });

  return { buffer: pdfBuffer, fileName };
};