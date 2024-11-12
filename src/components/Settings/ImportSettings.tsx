import React, { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import type { Expense } from '../../types';

interface ImportSettingsProps {
  onClose?: () => void;
}

const ImportSettings: React.FC<ImportSettingsProps> = ({ onClose }) => {
  const [isImporting, setIsImporting] = useState(false);
  const { addExpense } = useExpenseStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const expenses = JSON.parse(text) as Expense[];
      
      for (const expense of expenses) {
        await addExpense({
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          category: expense.category,
          paidBy: expense.paidBy,
          split: expense.split,
          tags: expense.tags,
        });
      }

      alert('Import completed successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import expenses. Please check the file format and try again.');
    } finally {
      setIsImporting(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleExport = () => {
    const expenses = useExpenseStore.getState().expenses;
    const dataStr = JSON.stringify(expenses, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Import Expenses</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a JSON file containing expense data to import.
        </p>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          disabled={isImporting}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Export Expenses</h3>
        <p className="text-sm text-gray-600 mb-4">
          Download all expenses as a JSON file.
        </p>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Export Expenses
        </button>
      </div>

      {onClose && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportSettings;
