import { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { Download, Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { Category, Tag, RecurringExpense } from '../../types';

interface ExportData {
  categories: Category[];
  tags: Tag[];
  recurringExpenses: RecurringExpense[];
}

const ImportSettings = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { categories, tags, recurringExpenses, addCategory, addTag, addRecurringExpense } = useExpenseStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const validateCategory = (category: Category) => {
    if (!category.id || !category.name || !category.group || !category.color) {
      throw new Error(`Invalid category format: ${JSON.stringify(category)}`);
    }
  };

  const validateTag = (tag: Tag) => {
    if (!tag.id || !tag.name) {
      throw new Error(`Invalid tag format: ${JSON.stringify(tag)}`);
    }
  };

  const validateRecurringExpense = (expense: RecurringExpense) => {
    if (!expense.id || !expense.amount || !expense.category || !expense.dayOfMonth || 
        !expense.frequency || !expense.paidBy || !expense.split) {
      throw new Error(`Invalid recurring expense format: ${JSON.stringify(expense)}`);
    }
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

      // Validate and import categories
      for (const category of data.categories) {
        validateCategory(category);
        await addCategory(category);
      }

      // Validate and import tags
      for (const tag of data.tags) {
        validateTag(tag);
        await addTag(tag);
      }

      // Validate and import recurring expenses
      for (const expense of data.recurringExpenses) {
        validateRecurringExpense(expense);
        await addRecurringExpense(expense);
      }

      setSuccess('Settings imported successfully');
      setFile(null);
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import settings');
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
          Import or export your categories, tags, and recurring expenses settings.
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
              Import Settings
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Import your categories, tags, and recurring expenses from a JSON file.
            </p>
            <form className="flex gap-2">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".json"
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
