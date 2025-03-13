import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { CategoryData, LocationData, DailyTrendData, BudgetStatus } from '../types';
import { createLogger } from '../../../core/utils/logger';

// Create a logger for this module
const logger = createLogger('analyticsExportService');

/**
 * Interface for export options
 */
export interface ExportOptions {
  title?: string;
  dateRange: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  fileName?: string;
  includeSections?: {
    summary?: boolean;
    categories?: boolean;
    locations?: boolean;
    trends?: boolean;
  };
}

/**
 * Interface for analytics data to be exported
 */
export interface AnalyticsExportData {
  categoryData: CategoryData[];
  locationData: LocationData[];
  trendData: DailyTrendData[];
  totalSpent: number;
  budgetStatus?: BudgetStatus | null;
  dateRange: string;
}

/**
 * Formats a date for display in exports
 */
function formatExportDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Generates a filename for the export
 */
function generateFileName(format: 'pdf' | 'csv', customName?: string): string {
  if (customName) {
    return customName.endsWith(`.${format}`) ? customName : `${customName}.${format}`;
  }
  return `expense_analytics_${Date.now()}.${format}`;
}

/**
 * Creates CSV content from analytics data
 */
export function createCSVContent(
  data: AnalyticsExportData,
  formatAmount: (amount: number) => string,
  options: ExportOptions = { dateRange: 'Custom Range' }
): string {
  const { categoryData, locationData, trendData, totalSpent, budgetStatus } = data;
  const includeSections = options.includeSections || { summary: true, categories: true, locations: true, trends: true };
  
  // Create CSV content with better formatting
  const csvRows: string[][] = [];
  
  // Add header with metadata
  csvRows.push(['AaFairShare Expense Analytics Report']);
  csvRows.push(['Generated on:', formatExportDate()]);
  csvRows.push(['Date Range:', options.dateRange]);
  
  if (includeSections.summary) {
    csvRows.push(['Total Spending:', formatAmount(totalSpent)]);
    
    // Add budget information if available
    if (budgetStatus) {
      csvRows.push(['Budget Target:', formatAmount(budgetStatus.target)]);
      csvRows.push(['Budget Status:', budgetStatus.status === 'on_track' ? 'On Track' : 
                                    budgetStatus.status === 'warning' ? 'Warning' : 'At Risk']);
      csvRows.push(['Budget Usage:', `${Math.round((budgetStatus.current / budgetStatus.target) * 100)}%`]);
    }
  }
  
  csvRows.push(['']);
  
  // Add category distribution section
  if (includeSections.categories && categoryData.length > 0) {
    csvRows.push(['CATEGORY DISTRIBUTION']);
    csvRows.push(['Category', 'Amount', 'Percentage']);
    
    categoryData.forEach(cat => {
      const percentage = totalSpent > 0 ? (cat.amount / totalSpent) * 100 : 0;
      csvRows.push([
        cat.category,
        formatAmount(cat.amount),
        `${percentage.toFixed(1)}%`
      ]);
    });
    
    csvRows.push(['']);
  }
  
  // Add location distribution section
  if (includeSections.locations && locationData.length > 0) {
    csvRows.push(['LOCATION DISTRIBUTION']);
    csvRows.push(['Location', 'Amount', 'Percentage']);
    
    locationData.forEach(loc => {
      const percentage = totalSpent > 0 ? (loc.amount / totalSpent) * 100 : 0;
      csvRows.push([
        loc.location,
        formatAmount(loc.amount),
        `${percentage.toFixed(1)}%`
      ]);
    });
    
    csvRows.push(['']);
  }
  
  // Add trend data section
  if (includeSections.trends && trendData.length > 0) {
    csvRows.push(['SPENDING TRENDS']);
    csvRows.push(['Date', 'Amount']);
    
    // Sort trend data by date
    const sortedTrendData = [...trendData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    sortedTrendData.forEach(trend => {
      csvRows.push([
        new Date(trend.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        formatAmount(trend.amount)
      ]);
    });
  }
  
  // Convert to CSV string with proper escaping
  return csvRows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma or newline
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
}

/**
 * Exports analytics data as a CSV file
 * 
 * @param data - The analytics data to export
 * @param formatAmount - Function to format currency amounts
 * @param options - Export options
 * @param preview - If true, returns the CSV content instead of downloading
 */
export async function exportAnalyticsToCSV(
  data: AnalyticsExportData,
  formatAmount: (amount: number) => string,
  options: ExportOptions = { dateRange: 'Custom Range' },
  preview: boolean = false
): Promise<string | void> {
  try {
    const csvString = createCSVContent(data, formatAmount, options);
    
    if (preview) {
      return csvString;
    }
    
    const fileName = generateFileName('csv', options.fileName);
    
    // Create download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link for download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    logger.info('CSV export completed successfully');
  } catch (error) {
    logger.error('Error exporting to CSV:', error);
    throw new Error(`Failed to export CSV: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a PDF document from analytics data
 */
export function createPDFDocument(
  data: AnalyticsExportData,
  formatAmount: (amount: number) => string,
  options: ExportOptions = { dateRange: 'Custom Range' }
): jsPDF {
  const { categoryData, locationData, trendData, totalSpent, budgetStatus } = data;
  const includeSections = options.includeSections || { summary: true, categories: true, locations: true, trends: true };
  
  // Create new PDF document (A4 size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.text('Expense Analytics Report', 105, 20, { align: 'center' });
  
  // Add metadata
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${formatExportDate()}`, 105, 30, { align: 'center' });
  doc.text(`Date Range: ${options.dateRange}`, 105, 35, { align: 'center' });
  
  let yPos = 45;
  
  // Add summary section
  if (includeSections.summary) {
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Summary', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.text(`Total Spending: ${formatAmount(totalSpent)}`, 20, yPos);
    yPos += 5;
    
    // Add budget information if available
    if (budgetStatus) {
      doc.text(`Budget Target: ${formatAmount(budgetStatus.target)}`, 20, yPos);
      yPos += 5;
      
      const statusText = budgetStatus.status === 'on_track' ? 'On Track' : 
                        budgetStatus.status === 'warning' ? 'Warning' : 'At Risk';
      
      doc.text(`Budget Status: ${statusText}`, 20, yPos);
      yPos += 5;
      
      const usagePercentage = Math.round((budgetStatus.current / budgetStatus.target) * 100);
      doc.text(`Budget Usage: ${usagePercentage}%`, 20, yPos);
      yPos += 10;
    } else {
      yPos += 5;
    }
  }
  
  // Add category distribution section
  if (includeSections.categories && categoryData.length > 0) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Category Distribution', 20, yPos);
    yPos += 10;
    
    // Create category table
    const categoryTableData = categoryData.map(cat => {
      const percentage = totalSpent > 0 ? (cat.amount / totalSpent) * 100 : 0;
      return [
        cat.category,
        formatAmount(cat.amount),
        `${percentage.toFixed(1)}%`
      ];
    });
    
    // @ts-ignore - jspdf-autotable types are not included
    doc.autoTable({
      head: [['Category', 'Amount', 'Percentage']],
      body: categoryTableData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 }
    });
    
    // @ts-ignore - jspdf-autotable types are not included
    yPos = doc.lastAutoTable.finalY + 15;
  }
  
  // Add location distribution section
  if (includeSections.locations && locationData.length > 0) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Location Distribution', 20, yPos);
    yPos += 10;
    
    // Create location table
    const locationTableData = locationData.map(loc => {
      const percentage = totalSpent > 0 ? (loc.amount / totalSpent) * 100 : 0;
      return [
        loc.location,
        formatAmount(loc.amount),
        `${percentage.toFixed(1)}%`
      ];
    });
    
    // @ts-ignore - jspdf-autotable types are not included
    doc.autoTable({
      head: [['Location', 'Amount', 'Percentage']],
      body: locationTableData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 }
    });
    
    // @ts-ignore - jspdf-autotable types are not included
    yPos = doc.lastAutoTable.finalY + 15;
  }
  
  // Add trend data section
  if (includeSections.trends && trendData.length > 0) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Spending Trends', 20, yPos);
    yPos += 10;
    
    // Sort trend data by date
    const sortedTrendData = [...trendData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Create trend table
    const trendTableData = sortedTrendData.map(trend => [
      new Date(trend.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      formatAmount(trend.amount)
    ]);
    
    // @ts-ignore - jspdf-autotable types are not included
    doc.autoTable({
      head: [['Date', 'Amount']],
      body: trendTableData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 }
    });
  }
  
  // Add footer
  if (options.includeFooter !== false) {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `AaFairShare Analytics Report - Page ${i} of ${pageCount}`,
        105,
        285,
        { align: 'center' }
      );
    }
  }
  
  return doc;
}

/**
 * Exports analytics data as a PDF file
 * 
 * @param data - The analytics data to export
 * @param formatAmount - Function to format currency amounts
 * @param options - Export options
 * @param preview - If true, returns the PDF data URL instead of downloading
 */
export async function exportAnalyticsToPDF(
  data: AnalyticsExportData,
  formatAmount: (amount: number) => string,
  options: ExportOptions = { dateRange: 'Custom Range' },
  preview: boolean = false
): Promise<string | void> {
  try {
    const doc = createPDFDocument(data, formatAmount, options);
    
    if (preview) {
      // Return data URL for preview
      return doc.output('datauristring');
    }
    
    const fileName = generateFileName('pdf', options.fileName);
    
    // Save the PDF
    doc.save(fileName);
    
    logger.info('PDF export completed successfully');
  } catch (error) {
    logger.error('Error exporting to PDF:', error);
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
} 