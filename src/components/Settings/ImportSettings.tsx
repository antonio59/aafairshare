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
    settleMonth,
    getMonthlyBalance
  } = useExpenseStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const parseSpreadsheetDate = (sheetName: string): string => {
    // Remove any potential spaces and split by spaces
    const parts = sheetName.trim().split(' ');
    if (parts.length !== 2) return '';
    
    const [month, year] = parts;
    const monthMap: { [key: string]: string } = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };

    if (!monthMap[month] || !year) return '';
    return `${year}-${monthMap[month]}-01`;
  };

  const parseAmount = (value: string): number => {
    // Remove currency symbol and any non-numeric characters except decimal point and minus
    const cleanValue = value.replace(/[^0-9.-]+/g, '');
    const amount = parseFloat(cleanValue);
    return isNaN(amount) ? 0 : amount;
  };

  const findColumnIndices = (worksheet: ExcelJS.Worksheet): { 
    descriptionCol: number, 
    amountCol: number 
  } | null => {
    let descriptionCol = 0;
    let amountCol = 0;

    // Check first two rows for headers
    for (let rowNum = 1; rowNum <= 2; rowNum++) {
      const row = worksheet.getRow(rowNum);
      row.eachCell((cell, colNumber) => {
        const value = cell.text.toLowerCase().trim();
        if (value === 'description') descriptionCol = colNumber;
        if (value === 'how much' || value === 'amount') amountCol = colNumber;
      });
    }

    if (!descriptionCol || !amountCol) return null;
    return { descriptionCol, amountCol };
  };

  const processExpenseRow = (
    row: ExcelJS.Row,
    descriptionCol: number,
    amountCol: number,
    section: string,
    date: string
  ): Omit<Expense, 'id'> | null => {
    const description = row.getCell(descriptionCol).text.trim();
    const amountText = row.getCell(amountCol).text.trim();
    const amount = parseAmount(amountText);

    if (!description || !amount) return null;

    let paidBy: string;
    let split: 'equal' | 'no-split';

    // Handle the different section types
    if (description.toLowerCase().includes('extras andres to antonio')) {
      paidBy = 'Andres';
      split = 'no-split';
    } else if (description.toLowerCase().includes('extras antonio to andres')) {
      paidBy = 'Antonio';
      split = 'no-split';
    } else if (section.toLowerCase().includes('paid by andres')) {
      paidBy = 'Andres';
      split = 'equal';
    } else if (section.toLowerCase().includes('paid by antonio')) {
      paidBy = 'Antonio';
      split = 'equal';
    } else {
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

  const isGreenFill = (fill: ExcelJS.Fill): boolean => {
    if ('fgColor' in fill && fill.type === 'pattern') {
      const color = (fill as any).fgColor?.argb;
      // Check for various shades of green
      return color === 'FF00FF00' || // Bright green
             color === 'FF92D050' || // Light green
             color === 'FF00B050';   // Dark green
    }
    return false;
  };

  const checkSettlement = (worksheet: ExcelJS.Worksheet): boolean => {
    let isSettled = false;
    let foundSettlementRow = false;

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        const value = cell.text.toLowerCase().trim();
        // Check for settlement indicators
        if (
          (value.includes('andres pay to antonio') || 
           value.includes('antonio pay to andres') ||
           value.includes('andres owes antonio') ||
           value.includes('antonio owes andres'))
        ) {
          foundSettlementRow = true;
          // Check if the cell or amount cell is highlighted green
          if (cell.fill && isGreenFill(cell.fill)) {
            isSettled = true;
          } else {
            // Check the amount in the next cell
            const amountCell = row.getCell(cell.col + 1);
            const amount = parseAmount(amountCell.text);
            if (amount === 0 && amountCell.fill && isGreenFill(amountCell.fill)) {
              isSettled = true;
            }
          }
        }
      });
    });

    return foundSettlementRow && isSettled;
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
      // Skip sheets named "Moving" or "House"
      if (['Moving', 'House'].includes(worksheet.name)) {
        continue;
      }

      const date = parseSpreadsheetDate(worksheet.name);
      if (!date) {
        summary.errors.push(`Invalid sheet name format in ${worksheet.name}`);
        continue;
      }

      const columns = findColumnIndices(worksheet);
      if (!columns) {
        summary.errors.push(`Invalid sheet format in ${worksheet.name}`);
        continue;
      }

      const { descriptionCol, amountCol } = columns;
      const monthExpenses: Omit<Expense, 'id'>[] = [];

      // Skip the first two header rows
      let currentSection = '';
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 2) return; // Skip header rows

        const description = row.getCell(descriptionCol).text.trim();
        
        // Update current section if row contains section header
        if (description.toLowerCase().includes('paid by')) {
          currentSection = description;
          return;
        }

        // Process expense row
        if (currentSection && description) {
          const expense = processExpenseRow(row, descriptionCol, amountCol, currentSection, date);
          if (expense) {
            monthExpenses.push(expense);
          }
        }
      });

      // Add all expenses for the month
      try {
        for (const expense of monthExpenses) {
          await addExpense(expense);
          summary.success++;
        }

        // Check if month should be settled
        if (checkSettlement(worksheet)) {
          const monthKey = date.substring(0, 7); // YYYY-MM format
          const balance = getMonthlyBalance(monthKey);
          await settleMonth(monthKey, 'System Import', balance);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        summary.errors.push(
          `Failed to process month ${worksheet.name}: ${errorMessage}`
        );
        summary.skipped += monthExpenses.length;
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
