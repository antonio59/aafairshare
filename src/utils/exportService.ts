'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { Expense, ExportableExpense, Settlement } from '@/types/expenses';
import { format } from 'date-fns';

class ExportError extends Error {
  constructor(message: string, public readonly code: 'NO_DATA' | 'AUTH_ERROR' | 'EXPORT_FAILED') {
    super(message);
    this.name = 'ExportError';
  }
}

interface ExportResult<T> {
  data: T;
  fileName: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ExportData {
  Date: string;
  Amount: number;
  Category: string;
  Location: string;
  Notes: string;
  'Paid By': string;
  'Split Type': string;
}

interface ExportMetadata {
  format: 'csv' | 'pdf';
  month: string;
  fileName: string;
  fileData: string;
}

type CategoryMap = Map<string, string>;
type LocationMap = Map<string, string>;

async function getSupabaseData() {
  try {
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {}
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ExportError('User not authenticated', 'AUTH_ERROR');

    const [categoriesResult, locationsResult] = await Promise.all([
      supabase.from('categories').select('id, category'),
      supabase.from('locations').select('id, location')
    ]);

    if (categoriesResult.error) throw categoriesResult.error;
    if (locationsResult.error) throw locationsResult.error;

    const categoryMap: CategoryMap = new Map(
      categoriesResult.data?.map(c => [c.id, c.category]) || []
    );

    const locationMap: LocationMap = new Map(
      locationsResult.data?.map(l => [l.id, l.location]) || []
    );

    return { categoryMap, locationMap };
  } catch (error) {
    if (error instanceof ExportError) throw error;
    throw new ExportError(
      `Failed to fetch reference data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'EXPORT_FAILED'
    );
  }
}

async function recordExport(params: ExportMetadata): Promise<void> {
  try {
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {}
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ExportError('User not authenticated', 'AUTH_ERROR');

    const { error } = await supabase.from('exports').insert({
      user_id: user.id,
      data_type: 'expenses',
      format: params.format,
      filters: { month: params.month },
      file_name: params.fileName,
      file_data: params.fileData,
    });

    if (error) throw error;
  } catch (error) {
    if (error instanceof ExportError) throw error;
    throw new ExportError(
      `Failed to record export: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'EXPORT_FAILED'
    );
  }
};

export async function exportToCSV(expenses: Expense[], month: string): Promise<ExportResult<Blob>> {
  try {
    if (!expenses.length) {
      throw new ExportError('No expenses to export', 'NO_DATA');
    }

    const { categoryMap, locationMap } = await getSupabaseData();

    const formattedExpenses: ExportableExpense[] = expenses.map(expense => ({
      ...expense,
      category: categoryMap.get(expense.category_id) || 'Unknown',
      location: locationMap.get(expense.location_id) || 'Unknown',
    }));

    const headers = ['Date', 'Amount', 'Category', 'Location', 'Notes', 'Paid By', 'Split Type'] as const;
    const rows = formattedExpenses.map(expense => [
      format(new Date(expense.date), 'dd/MM/yyyy'),
      `£${expense.amount.toFixed(2)}`,
      expense.category,
      expense.location,
      expense.notes,
      expense.users.name,
      expense.split_type
    ]);

    // Calculate totals and settlements
    const total = formattedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const userExpenses = new Map<string, number>();
    formattedExpenses.forEach(exp => {
      const amount = exp.split_type === 'Equal' ? exp.amount / 2 : exp.amount;
      userExpenses.set(exp.users.name, (userExpenses.get(exp.users.name) || 0) + amount);
    });

    // Calculate settlements between users
    const settlements: Settlement[] = [];
    const users = Array.from(userExpenses.keys());
    const averagePerUser = total / users.length;

    users.forEach(user => {
      const userAmount = userExpenses.get(user) || 0;
      const difference = userAmount - averagePerUser;
      
      if (Math.abs(difference) > 0.01) { // Account for floating point precision
        if (difference > 0) {
          // This user needs to be paid back
          const otherUsers = users.filter(u => u !== user);
          const amountPerUser = difference / otherUsers.length;
          
          otherUsers.forEach(otherUser => {
            settlements.push({
              id: `${otherUser}-${user}-${month}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              from: otherUser,
              to: user,
              amount: amountPerUser,
              month,
              status: 'pending',
              created_at: new Date().toISOString(),
            });
          });
        }
      }
    });

    // Add summary section
    rows.push(
      [],
      ['Summary'],
      ['Total Expenses', `£${total.toFixed(2)}`],
      ['Average per User', `£${averagePerUser.toFixed(2)}`],
      [],
      ['Current Balances']
    );

    for (const [user, amount] of userExpenses.entries()) {
      rows.push([user, `£${amount.toFixed(2)}`]);
    }

    rows.push(
      [],
      ['Required Settlements']
    );

    for (const settlement of settlements) {
      rows.push([`${settlement.from} → ${settlement.to}`, `£${settlement.amount.toFixed(2)}`]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(
      [new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], 
      { type: 'text/csv;charset=utf-8-sig' }
    );
    
    const fileName = `expenses-${format(new Date(month), 'yyyy-MM')}.csv`;
    
    await recordExport({
      format: 'csv',
      month,
      fileName,
      fileData: csvContent
    });

    return { data: blob, fileName };
  } catch (error) {
    if (error instanceof ExportError) throw error;
    throw new ExportError(
      `Failed to export CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'EXPORT_FAILED'
    );
  }
}

export async function exportToPDF(
  expenses: Expense[], 
  month: string
): Promise<ExportResult<Buffer>> {
  try {
    if (!expenses.length) {
      throw new ExportError('No expenses to export', 'NO_DATA');
    }

    const doc = new jsPDF();
    const { categoryMap, locationMap } = await getSupabaseData();
    const margin = 15;
    
    // Format expenses
    const formattedExpenses: ExportableExpense[] = expenses.map(expense => ({
      ...expense,
      category: categoryMap.get(expense.category_id) || 'Unknown',
      location: locationMap.get(expense.location_id) || 'Unknown',
    }));

    // Calculate total
    const totalExpenses = formattedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Add header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const title = 'AAFairShare';
    doc.text(title, doc.internal.pageSize.width / 2, margin, { align: 'center' });
    
    // Add report title
    doc.setFontSize(16);
    doc.text('Monthly Expense Summary', margin, margin + 15);
    
    // Add month and total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const monthText = `Month: ${format(new Date(month), 'MMMM yyyy')}`;
    const totalText = `Total: £${totalExpenses.toFixed(2)}`;
    
    doc.text(monthText, margin, margin + 25);
    doc.text(totalText, doc.internal.pageSize.width - margin, margin + 25, { align: 'right' });

    // Add expenses table
    type TableColumn = 0 | 1 | 2 | 3 | 4 | 5;

    const tableConfig = {
      head: [['Date', 'Category', 'Location', 'Amount', 'Split Type', 'Notes']],
      body: formattedExpenses.map(expense => [
        format(new Date(expense.date), 'dd/MM/yyyy'),
        expense.category,
        expense.location,
        `£${expense.amount.toFixed(2)}`,
        expense.split_type,
        expense.notes || ''
      ]),
      startY: margin + 35,
      theme: 'grid',
      styles: { 
        fontSize: 10,
        cellPadding: 2,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25, align: 'right' },
        4: { cellWidth: 25 },
        5: { cellWidth: 35 }
      } as Record<TableColumn, { cellWidth: number; align?: 'right' }>,
      margin: { left: margin, right: margin },
      didDrawPage: (data: { cursor: { y: number } }) => {
        const pageHeight = doc.internal.pageSize.height;
        if (data.cursor.y > pageHeight - 50) {
          doc.addPage();
        }
      }
    };

    // Calculate settlements
    const userExpenses = new Map<string, number>();
    formattedExpenses.forEach(exp => {
      const amount = exp.split_type === 'Equal' ? exp.amount / 2 : exp.amount;
      userExpenses.set(exp.users.name, (userExpenses.get(exp.users.name) || 0) + amount);
    });

    // Calculate settlements between users
    const settlements: Settlement[] = [];
    const users = Array.from(userExpenses.keys());
    const averagePerUser = totalExpenses / users.length;

    users.forEach(user => {
      const userAmount = userExpenses.get(user) || 0;
      const difference = userAmount - averagePerUser;
      
      if (Math.abs(difference) > 0.01) { // Account for floating point precision
        if (difference > 0) {
          // This user needs to be paid back
          const otherUsers = users.filter(u => u !== user);
          const amountPerUser = difference / otherUsers.length;
          
          otherUsers.forEach(otherUser => {
            settlements.push({
              id: `${otherUser}-${user}-${month}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              from: otherUser,
              to: user,
              amount: amountPerUser,
              month,
              status: 'pending',
              created_at: new Date().toISOString(),
            });
          });
        }
      }
    });

    // Sort expenses and settlements for better visualization
    const sortedExpenses = Array.from(userExpenses.entries())
      .sort(([, a], [, b]) => b - a);
    const sortedSettlements = settlements.sort((a, b) => b.amount - a.amount);

    doc.autoTable(tableConfig);

    // Add summary section
    const finalY = (doc.lastAutoTable?.finalY || margin + 35) + 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Summary', margin, finalY);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Expenses: £${totalExpenses.toFixed(2)}`, margin, finalY + 10);
    doc.text(`Average per User: £${averagePerUser.toFixed(2)}`, margin, finalY + 20);

    // Add current balances section
    doc.setFont('helvetica', 'bold');
    doc.text('Current Balances', margin, finalY + 35);
    doc.setFont('helvetica', 'normal');
    
    sortedExpenses.forEach(([user, amount], index) => {
      doc.text(
        `${user}: £${amount.toFixed(2)}`,
        margin,
        finalY + 45 + (index * 7)
      );
    });

    // Add settlements section
    const settlementsY = finalY + 45 + (sortedExpenses.length * 7) + 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Required Settlements', margin, settlementsY);
    doc.setFont('helvetica', 'normal');

    sortedSettlements.forEach((settlement, index) => {
      doc.text(
        `${settlement.from} → ${settlement.to}: £${settlement.amount.toFixed(2)}`,
        margin,
        settlementsY + 10 + (index * 7)
      );
    });

    const fileName = `expenses-${format(new Date(month), 'yyyy-MM')}.pdf`;
    const pdfOutput = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfOutput);

    await recordExport({
      format: 'pdf',
      month,
      fileName,
      fileData: pdfBuffer.toString('base64')
    });

    doc.save(fileName);
    return { data: pdfBuffer, fileName };
  } catch (error) {
    if (error instanceof ExportError) throw error;
    throw new ExportError(
      `Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'EXPORT_FAILED'
    );
  }
}