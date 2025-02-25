import { jsPDF } from 'jspdf';
import ExcelJS from 'exceljs';
import autoTable from 'jspdf-autotable';
import sanitizeHtml from 'sanitize-html';

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
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Prepare headers
  const tableColumns = columns || Object.keys(data[0] || {}).map(key => ({
    header: key.charAt(0).toUpperCase() + key.slice(1),
    key
  }));

  let currentRow = 1;

  // Add title if provided
  if (title) {
    const titleRow = worksheet.addRow([sanitizeHtml(title)]);
    titleRow.font = { bold: true, size: 14 };
    worksheet.mergeCells(currentRow, 1, currentRow, tableColumns.length);
    currentRow += 1;
  }

  // Add description if provided
  if (description) {
    const descRow = worksheet.addRow([sanitizeHtml(description)]);
    descRow.font = { size: 11 };
    worksheet.mergeCells(currentRow, 1, currentRow, tableColumns.length);
    currentRow += 1;
  }

  // Add empty row for spacing
  if (title || description) {
    currentRow += 1;
  }

  // Add headers
  worksheet.columns = tableColumns.map(col => ({
    header: sanitizeHtml(col.header),
    key: col.key,
    width: col.width || 15
  }));

  // Style headers
  const headerRow = worksheet.getRow(currentRow);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add data
  data.forEach(item => {
    const rowData = tableColumns.reduce((acc, col) => {
      acc[col.key] = sanitizeHtml(String((item as any)[col.key] || ''));
      return acc;
    }, {} as Record<string, string>);
    worksheet.addRow(rowData);
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

export function formatDataForExport(data: unknown): unknown[] {
  if (!Array.isArray(data)) return [data];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      return Object.fromEntries(
        Object.entries(item).map(([key, value]) => [
          key,
          sanitizeHtml(String(value || ''))
        ])
      );
    }
    return sanitizeHtml(String(item || ''));
  });
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}
