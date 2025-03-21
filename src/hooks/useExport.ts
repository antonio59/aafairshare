import { useState } from 'react';
import { Expense } from '@/utils/types';
import { exportToCSV, exportToPDF } from '@/utils/exportService';

interface UseExportReturn {
  isExporting: boolean;
  exportToCSV: (expenses: Expense[], month: string) => Promise<void>;
  exportToPDF: (expenses: Expense[], month: string) => Promise<void>;
}

export const useExport = (): UseExportReturn => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportToCSV = async (expenses: Expense[], month: string) => {
    try {
      setIsExporting(true);
      await exportToCSV(expenses, month);
    } catch (error) {
      console.error('Failed to export to CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToPDF = async (expenses: Expense[], month: string) => {
    try {
      setIsExporting(true);
      await exportToPDF(expenses, month);
    } catch (error) {
      console.error('Failed to export to PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportToCSV: handleExportToCSV,
    exportToPDF: handleExportToPDF
  };
};