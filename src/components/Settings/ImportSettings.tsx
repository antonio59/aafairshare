import { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { Download, Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { Category, Tag, RecurringExpense, Expense } from '../../types';
import ExcelJS from 'exceljs';

interface ExportData {
  categories: Category[];
  tags: Tag[];
  recurringExpenses: RecurringExpense[];
}

interface ImportSummary {
  success: number;
  skipped: number;
  errors: string[];
}

const ImportSettings = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { 
    categories, 
    tags, 
    recurringExpenses, 
    addCategory, 
    addTag, 
    addRecurringExpense,
    addExpense,
    settleMonth
  } = useExpenseStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const parseSpreadsheetDate = (sheetName: string): string => {
    const [month, year] = sheetName.split(' ');
    const monthMap: { [key: string]: string } = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    return `${year}-${monthMap[month]}-01`;
  };

  const processExpenseRow = async (
    row: ExcelJS.Row,
    section: string,
    date: string
  ): Promise<Omit<Expense, 'id'> | null> => {
    const description = row.getCell('Description').text;
    const amount = parseFloat(row.getCell('How Much').text);

    if (!description || !amount || isNaN(amount)) return null;

    let paidBy: string;
    let split: 'equal' | 'no-split';

    switch (section) {
      case 'Andres Paid':
        paidBy = 'Andres';
        split = 'equal';
        break;
      case 'Antonio Paid':
        paidBy = 'Antonio';
        split = 'equal';
        break;
      case 'Extras Antonio to Andres':
        paidBy = 'Antonio';
        split = 'no-split';
        break;
      case 'Extras Andres to Antonio':
        paidBy = 'Andres';
        split = 'no-split';
        break;
      default:
        return null;
    }

    return {
      description,
      amount,
      date,
      category: 'Other', // Default category as per requirements
      paidBy,
      split,
      tags: []
    };
  };

  const checkSettlement = async (worksheet: ExcelJS.Worksheet): Promise<boolean> => {
    const lastRows = worksheet.rowCount;
    
    for (let row = lastRows; row > lastRows - 2; row--) {
      const currentRow = worksheet.getRow(row);
      const descriptionCell = currentRow.getCell('Description');
      const amountCell = currentRow.getCell('How Much');
      
      if (descriptionCell.text === 'Andres Pay Antonio' || 
          descriptionCell.text === 'Antonio Pay Andres') {
        // Check if the amount cell is highlighted green
        const fill = (amountCell.fill as ExcelJS.Fill);
        if (fill.type === 'pattern' && fill.pattern === 'solid' && 
            fill.fgColor?.argb === 'FF00FF00') {
          return true;
        }
      }
    }
    return false;
  };

  const handleSpreadsheetImport = async (file: File): Promise<ImportSummary> => {
    const summary: ImportSummary = {
      success: 0,
      skipped: 0,
      errors: []
    };

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());

    for (const worksheet of workbook.worksheets) {
      const date = parseSpreadsheetDate(worksheet.name);
      
      // Find header row and column indices
      let headerRow = 1;
      let descriptionCol = 0;
      let amountCol = 0;
      let sectionCol = 0;

      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          if (cell.text === 'Description') descriptionCol = colNumber;
          if (cell.text === 'How Much') amountCol = colNumber;
          if (cell.text === 'Section') sectionCol = colNumber;
        });
        if (descriptionCol && amountCol && sectionCol) headerRow = rowNumber;
      });

      if (!descriptionCol || !amountCol || !sectionCol) {
        summary.errors.push(`Invalid sheet format in ${worksheet.name}`);
        continue;
      }

      // Process each section
      const sections = ['Andres Paid', 'Antonio Paid', 
                       'Extras Antonio to Andres', 'Extras Andres to Antonio'];
      
      worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
        if (rowNumber <= headerRow) return;

        const section = row.getCell(sectionCol).text;
        if (!sections.includes(section)) return;

        const expense = await processExpenseRow(row, section, date);
        if (expense) {
          try {
            await addExpense(expense);
            summary.success++;
          } catch (err) {
            summary.errors.push(
              `Failed to import ${expense.description}: ${err}`
            );
            summary.skipped++;
          }
        } else {
          summary.skipped++;
        }
      });

      // Check if month is settled
      if (await checkSettlement(worksheet)) {
        await settleMonth(
          date.substring(0, 7), // YYYY-MM format
          'System Import',
          0 // Balance will be calculated by the store
        );
      }
    }

    return summary;
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (file.name.endsWith('.json')) {
        // Handle existing JSON import logic
        const content = await file.text();
        const data: ExportData = JSON.parse(content);

        // Validate structure
        if (!data.categories || !Array.isArray(data.categories)) {
          throw new Error('Invalid file format: missing categories array');
        }
        if (!data.tags || !Array.isArray(data.tags)) {
          throw new Error('Invalid file format: missing tags array');
        }
        if (!data.recurringExpenses || !Array.isArray(data.recurringExpenses)) {
          throw new Error('Invalid file format: missing recurring expenses array');
        }

        // Import categories
        for (const category of data.categories) {
          await addCategory(category);
        }

        // Import tags
        for (const tag of data.tags) {
          await addTag(tag);
        }

        // Import recurring expenses
        for (const expense of data.recurringExpenses) {
          await addRecurringExpense(expense);
        }

        setSuccess('Settings imported successfully');
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Handle spreadsheet import
        const summary = await handleSpreadsheetImport(file);
        setSuccess(
          `Import completed: ${summary.success} expenses imported, ` +
          `${summary.skipped} skipped. ` +
          (summary.errors.length > 0 ? 
            `Errors: ${summary.errors.join('; ')}` : '')
        );
      } else {
        throw new Error('Unsupported file format. Please use .json, .xlsx, or .xls');
      }

      setFile(null);
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data: ExportData = {
        categories: categories.filter((c: Category) => c !== null),
        tags: tags.filter((t: Tag) => t !== null),
        recurringExpenses: recurringExpenses.filter((e: RecurringExpense) => e !== null)
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aafairshare-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Settings exported successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Import/Export Settings</h3>
        <p className="text-sm text-gray-600 mb-6">
          Import expenses from spreadsheet (.xlsx, .xls) or import/export settings (.json).
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import Data
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Import expenses from spreadsheet (.xlsx, .xls) or settings from JSON file.
            </p>
            <form className="flex gap-2">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".json,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              <button
                type="button"
                onClick={handleImport}
                disabled={!file || isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                Import
              </button>
            </form>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Settings
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Export your categories, tags, and recurring expenses to a JSON file.
            </p>
            <button
              onClick={handleExport}
              disabled={isLoading || (categories.length === 0 && tags.length === 0 && recurringExpenses.length === 0)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Export Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportSettings;
