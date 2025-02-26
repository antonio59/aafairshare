import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Define interfaces
export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportData {
  columns: ExportColumn[];
  data: any[];
  filename: string;
  title?: string;
  subtitle?: string;
}

// Export to Excel
export function exportToExcel(exportData: ExportData): void {
  try {
    const { columns, data, filename, title, subtitle } = exportData;
    // Create workbook and worksheet
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(data);
    
    // Set column widths
    const colWidths = columns.map(col => ({ wch: col.width || 15 }));
    ws['!cols'] = colWidths;
    
    // Add title and subtitle
    const titleRow = title 
      ? { A1: { v: title, t: 's', s: { font: { bold: true, sz: 16 } } } }
      : {};
    const subtitleRow = subtitle 
      ? { A2: { v: subtitle, t: 's', s: { font: { sz: 12 } } } }
      : {};
    
    ws['!merges'] = title 
      ? [
        { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } }
      ]
      : [];
    
    if (subtitle) {
      ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } });
    }
    
    // Add worksheet to workbook
    utils.book_append_sheet(wb, ws, 'Expenses');
    
    // Write to file
    writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

// Export to PDF
export function exportToPDF(exportData: ExportData): void {
  try {
    const { columns, data, filename, title, subtitle } = exportData;
    
    const doc = new jsPDF();
    
    // Add title
    if (title) {
      doc.setFontSize(18);
      doc.text(title, 14, 22);
    }
    
    // Add subtitle if provided
    if (subtitle) {
      doc.setFontSize(12);
      doc.text(subtitle, 14, 30);
    }
    
    // Prepare table
    const tableHeaders = columns.map(col => col.header);
    const tableData = data.map(item => 
      columns.map(col => item[col.key])
    );
    
    // Generate table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: subtitle ? 35 : (title ? 30 : 20),
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: columns.reduce((acc: Record<number, { cellWidth: number }>, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width };
        }
        return acc;
      }, {}),
    });
    
    // Save PDF
    doc.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}
