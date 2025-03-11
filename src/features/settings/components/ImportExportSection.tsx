import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportExpenses } from '../../../services/importExportService';

// Import the ExportFormat type
type ExportFormat = 'json' | 'csv' | 'pdf';

export const ImportExportSection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');

  const handleExport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const _currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const blob = await exportExpenses(exportFormat);
      
      // Create download link with branded filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `aafairshare-expense-report-${timestamp}.${exportFormat}`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-100 pt-6">
      <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center">
        <Download size={18} className="mr-2 text-gray-500" />
        Export Data
      </h3>
      
      <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Export Expenses</h4>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                disabled={loading}
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Exporting...' : (
                <>
                  {exportFormat === 'csv' ? (
                    <FileSpreadsheet size={16} className="mr-2" />
                  ) : (
                    <FileText size={16} className="mr-2" />
                  )}
                  Export Expenses
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Download your expense data in {exportFormat.toUpperCase()} format with AaFairShare branding
            {exportFormat === 'pdf' && (
              <span className="block text-amber-600 mt-1">
                Note: PDF export is currently limited in browser environments. 
                For better results, use CSV format.
              </span>
            )}
          </p>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};