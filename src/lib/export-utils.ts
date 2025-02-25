import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
  data: unknown[];
  title?: string;
  description?: string;
  columns?: Array<{
    header: string;
    key: string;
    width?: number;
  }>;
}

export async function exportToPDF({
  data,
  title = 'Export',
  description,
  columns
}: ExportOptions): Promise<Blob> {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  // Add description if provided
  if (description) {
    doc.setFontSize(11);
    doc.text(description, 14, 25);
  }

  // Prepare table data
  const tableColumns = columns || Object.keys(data[0] || {}).map(key => ({
    header: key.charAt(0).toUpperCase() + key.slice(1),
    key
  }));

  const tableRows = data.map(item =>
    tableColumns.map(col => String((item as any)[col.key] || ''))
  );

  // Add table
  autoTable(doc, {
    head: [tableColumns.map(col => col.header)],
    body: tableRows,
    startY: description ? 30 : 20,
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    columnStyles: tableColumns.reduce((acc, col, index) => {
      if (col.width) acc[index] = { cellWidth: col.width };
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
  });

  return doc.output('blob');
}

export async function exportToExcel({
  data,
  title = 'Export',
  description,
  columns
}: ExportOptions): Promise<Blob> {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Prepare headers
  const tableColumns = columns || Object.keys(data[0] || {}).map(key => ({
    header: key.charAt(0).toUpperCase() + key.slice(1),
    key
  }));

  // Create worksheet data
  const ws_data = [
    // Headers
    tableColumns.map(col => col.header),
    // Data rows
    ...data.map(item =>
      tableColumns.map(col => (item as any)[col.key] || '')
    )
  ];

  // Add title and description if provided
  if (title || description) {
    ws_data.unshift([]);  // Empty row for spacing
    if (description) ws_data.unshift([description]);
    if (title) ws_data.unshift([title]);
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // Style the title and description
  if (title || description) {
    let row = 0;
    if (title) {
      ws['!merges'] = ws['!merges'] || [];
      ws['!merges'].push({ s: { r: row, c: 0 }, e: { r: row, c: tableColumns.length - 1 } });
      row++;
    }
    if (description) {
      ws['!merges'].push({ s: { r: row, c: 0 }, e: { r: row, c: tableColumns.length - 1 } });
    }
  }

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Generate blob
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function formatDataForExport(data: unknown): unknown[] {
  if (!Array.isArray(data)) return [data];
  return data;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}
