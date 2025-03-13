import { supabase } from '../core/api/supabase';
import { getExpenses } from '../features/expenses/api/expenseApi';

type ExportFormat = 'json' | 'csv' | 'pdf';

interface Expense {
  id?: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  split_type: 'equal' | 'none';
  paid_by: string;
  created_at?: string;
  updated_at?: string;
}

interface CSVHeaderMap {
  amount: number;
  category: number;
  date: number;
  notes: number;
  split_type: number;
  [key: string]: number;
}

// Remove PDFKit import and define a flag for PDF support
const _PDF_SUPPORTED = false; // Set to false since we're removing PDFKit

/**
 * Export user expenses as JSON data
 * @param format - Export format ('json' or 'csv')
 * @returns A blob with the exported data
 */
export const exportExpenses = async (format: ExportFormat = 'json'): Promise<Blob> => {
  try {
    // Get current user ID from Supabase session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const expenses = await getExpenses(user.id);
    
    if (!expenses || expenses.length === 0) {
      throw new Error('No expenses found to export');
    }
    
    if (format === 'json') {
      return new Blob([JSON.stringify(expenses, null, 2)], { type: 'application/json' });
    } else if (format === 'csv') {
      // Create CSV header
      const headers = [
        'Title', 'Amount', 'Currency', 'Category', 
        'Date', 'Notes', 'Split Type'
      ].join(',');
      
      // Create CSV rows
      const rows = expenses.map(expense => [
        expense.amount,
        expense.category,
        expense.date,
        `"${(expense.notes || '').replace(/"/g, '""')}"`,
        expense.split_type
      ].join(','));
      
      const csvData = [headers, ...rows].join('\n');
      return new Blob([csvData], { type: 'text/csv' });
    } else if (format === 'pdf') {
      // Replace PDFKit implementation with a simple message
      console.warn('PDF export is currently not supported in the browser version');
      
      // Create a text blob with instructions instead
      const message = 
        'PDF export is currently not available in the browser version.\n' +
        'Please use the CSV or JSON export options instead.';
      
      return new Blob([message], { type: 'text/plain' });
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting expenses:', error);
    throw error;
  }
};

/**
 * Import expenses from JSON data
 * @param fileContent - The file content as a string
 * @param format - Import format ('json' or 'csv')
 * @returns The imported and processed expenses
 */
export const importExpenses = async (
  fileContent: string,
  format: ExportFormat = 'json'
): Promise<Expense[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    let expensesToImport: Expense[] = [];
    
    if (format === 'json') {
      // Parse JSON data
      const data = JSON.parse(fileContent);
      
      // Validate that it's an array of expense objects
      if (!Array.isArray(data)) {
        throw new Error('Invalid JSON format. Expected an array of expenses.');
      }
      
      expensesToImport = data.map((expense: Partial<Expense>) => ({
        amount: parseFloat(String(expense.amount)) || 0,
        date: expense.date || new Date().toISOString().split('T')[0],
        category: expense.category || 'other',
        split_type: expense.split_type || 'equal',
        notes: expense.notes || 'Imported expense',
        paid_by: user.id
      }));
    } else if (format === 'csv') {
      // Split into lines and parse CSV
      const lines = fileContent.trim().split('\n');
      const headers = lines[0].split(',');
      
      const headerMap: CSVHeaderMap = {
        amount: headers.findIndex(h => h.toLowerCase().includes('amount')),
        category: headers.findIndex(h => h.toLowerCase().includes('category')),
        date: headers.findIndex(h => h.toLowerCase().includes('date')),
        notes: headers.findIndex(h => h.toLowerCase().includes('notes')),
        split_type: headers.findIndex(h => h.toLowerCase().includes('split'))
      };
      
      expensesToImport = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          amount: headerMap.amount >= 0 ? parseFloat(values[headerMap.amount]) || 0 : 0,
          date: headerMap.date >= 0 ? values[headerMap.date] || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: headerMap.category >= 0 ? values[headerMap.category] || 'other' : 'other',
          split_type: headerMap.split_type >= 0 ? (values[headerMap.split_type] as 'equal' | 'none') || 'equal' : 'equal',
          notes: headerMap.notes >= 0 ? values[headerMap.notes]?.replace(/^"|"$/g, '') || 'Imported expense' : 'Imported expense',
          paid_by: user.id
        };
      });
    } else {
      throw new Error('Unsupported import format');
    }
    
    // Insert imported expenses into the database
    const { data, error } = await supabase
      .from('expenses')
      .insert(expensesToImport)
      .select();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
}; 