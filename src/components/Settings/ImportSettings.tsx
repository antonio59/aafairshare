import React, { useState } from 'react';
import { FileSpreadsheet, Upload, AlertCircle, Info } from 'lucide-react';
import { useExpenseStore } from '../../store/expenseStore';
import * as XLSX from 'xlsx';
import { parse, format } from 'date-fns';

const ImportSettings = () => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { addExpense, categories, settleMonth } = useExpenseStore();

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      // Track import statistics
      let totalImported = 0;
      let totalSkipped = 0;
      let processedMonths = new Set<string>();

      // Find "Other" category
      const otherCategory = categories.find(c => c.name === 'Other miscellaneous expenses');
      if (!otherCategory) {
        throw new Error('Default "Other" category not found');
      }

      // Process each sheet (month)
      for (const sheetName of workbook.SheetNames) {
        try {
          // Parse month from sheet name (e.g., "November 2024")
          const monthDate = parse(sheetName, 'MMMM yyyy', new Date());
          if (isNaN(monthDate.getTime())) {
            console.warn(`Invalid sheet name format: ${sheetName}, skipping`);
            continue;
          }

          const monthKey = format(monthDate, 'yyyy-MM');
          processedMonths.add(monthKey);

          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            raw: false,
            blankrows: false
          });

          // Skip first two header rows
          if (jsonData.length < 3) continue;

          // Find column indexes
          const headers = jsonData[1] as string[];
          const colIndexes = {
            description: headers.findIndex(h => h?.toLowerCase().includes('description')),
            amount: headers.findIndex(h => h?.toLowerCase().includes('how much')),
            paidByAndres: headers.findIndex(h => h?.toLowerCase().includes('paid by andres')),
            paidByAntonio: headers.findIndex(h => h?.toLowerCase().includes('paid by antonio')),
            extrasAndres: headers.findIndex(h => h?.toLowerCase().includes('extras andres to antonio')),
            extrasAntonio: headers.findIndex(h => h?.toLowerCase().includes('extras antonio to andres')),
            settlement: headers.findIndex(h => 
              h?.toLowerCase().includes('andres pay to antonio') || 
              h?.toLowerCase().includes('antonio pay to andres')
            ),
          };

          // Process data rows
          for (let i = 2; i < jsonData.length; i++) {
            const row = jsonData[i] as string[];
            if (!row || row.length === 0) continue;

            try {
              // Get description and amount
              const description = row[colIndexes.description];
              const amount = parseFloat(String(row[colIndexes.amount]).replace(/[£,]/g, ''));

              if (isNaN(amount)) {
                totalSkipped++;
                continue;
              }

              // Determine paidBy and split
              let paidBy = 'Andres';
              let split = 'equal' as const;

              // Check extras columns first (they take precedence)
              if (row[colIndexes.extrasAndres]) {
                paidBy = 'Antonio';
                split = 'no-split';
              } else if (row[colIndexes.extrasAntonio]) {
                paidBy = 'Andres';
                split = 'no-split';
              } else {
                // Check regular paid by columns
                if (row[colIndexes.paidByAntonio]) {
                  paidBy = 'Antonio';
                }
              }

              // Create expense
              const expense = {
                description: description || 'Untitled Expense',
                amount,
                date: format(monthDate, 'yyyy-MM-dd'),
                category: otherCategory.id,
                paidBy,
                split,
                tags: [],
              };

              addExpense(expense);
              totalImported++;

            } catch (rowError) {
              console.warn(`Error processing row ${i + 1}:`, rowError);
              totalSkipped++;
            }
          }

          // Check for settlement
          // Note: This is a simplified check. In a real implementation,
          // you'd need to check cell background colors using XLSX.utils.decode_cell
          const settlementRow = jsonData.find(row => 
            row[colIndexes.settlement] && 
            String(row[colIndexes.settlement]).toLowerCase().includes('settled')
          );

          if (settlementRow) {
            settleMonth(monthKey, 'System Import', 0);
          }

        } catch (sheetError) {
          console.error(`Error processing sheet "${sheetName}":`, sheetError);
          throw sheetError;
        }
      }

      if (totalImported === 0) {
        setError('No valid expenses found in the file. Please check the format.');
      } else {
        setSuccess(
          `Successfully imported ${totalImported} expense${totalImported !== 1 ? 's' : ''} ` +
          `from ${processedMonths.size} month${processedMonths.size !== 1 ? 's' : ''}` +
          (totalSkipped > 0 ? ` (${totalSkipped} row${totalSkipped !== 1 ? 's' : ''} skipped)` : '')
        );
      }

      e.target.value = ''; // Reset file input
    } catch (err) {
      setError('Error importing data. Please check the file format.');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Import Data</h3>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="flex flex-col items-center text-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload your Google Sheets export (.xlsx)
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportData}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                disabled={importing}
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <h4 className="font-medium text-blue-900">Expected File Format:</h4>
            </div>
            <div className="ml-8">
              <p className="text-sm text-blue-800 mb-2">Your spreadsheet should have:</p>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1 ml-4">
                <li>Separate sheet for each month (named "Month YYYY")</li>
                <li>First two rows reserved for headers</li>
                <li>Required columns:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Description</li>
                    <li>How Much</li>
                    <li>Paid By Andres/Antonio</li>
                    <li>Extras columns (if applicable)</li>
                  </ul>
                </li>
              </ul>
              <p className="text-sm text-blue-800 mt-3">
                All expenses will be imported under the "Other" category
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportSettings;