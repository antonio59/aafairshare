import { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';

type ExportFormat = 'json' | 'pdf' | 'excel';

const ExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const expenses = useExpenseStore.getState().expenses;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === 'json') {
        const dataStr = JSON.stringify(expenses, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Dynamically import export utilities when needed
        const { exportToPDF, exportToExcel } = await import('../../utils/exportUtils');
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

        if (exportFormat === 'pdf') {
          await exportToPDF(expenses, [], [], currentMonth);
        } else if (exportFormat === 'excel') {
          await exportToExcel(expenses, [], [], currentMonth);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      // You might want to show a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <select
        value={exportFormat}
        onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
        className="px-3 py-2 border rounded-md bg-white text-gray-700"
        disabled={isExporting}
      >
        <option value="json">JSON</option>
        <option value="pdf">PDF</option>
        <option value="excel">Excel</option>
      </select>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`px-4 py-2 rounded-md transition-colors ${isExporting 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
      >
        {isExporting ? 'Exporting...' : 'Export'}
      </button>
    </div>
  );
};

export default ExportButton;
