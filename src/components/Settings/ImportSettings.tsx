import { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import type { Category } from '../../types';

const ImportSettings = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { categories } = useExpenseStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          // Validate imported data
          if (!data.categories || !Array.isArray(data.categories)) {
            throw new Error('Invalid file format: missing categories array');
          }

          // Validate each category
          data.categories.forEach((category: Category) => {
            if (!category.id || !category.name || !category.group) {
              throw new Error('Invalid category format');
            }
          });

          // TODO: Import categories
          console.log('Importing categories:', data.categories);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to parse file');
        }
      };

      reader.readAsText(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    }
  };

  const handleExport = () => {
    try {
      const data = {
        categories: categories.filter((c: Category) => c !== null)
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'categories.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export categories');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Import/Export Settings</h3>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import Categories
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="flex-1"
              />
              <button
                onClick={handleImport}
                disabled={!file}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Import
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Categories
            </label>
            <button
              onClick={handleExport}
              disabled={categories.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Export Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportSettings;
