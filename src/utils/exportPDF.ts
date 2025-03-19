import { jsPDF } from 'jspdf';
import { Expense, getSupabaseData, recordExport } from './types';

// Configure jsPDF with default settings
const PDF_OPTIONS: {
  orientation: 'p' | 'l' | 'portrait' | 'landscape';
  unit: 'mm';
  format: string;
} = {
  orientation: 'p',
  unit: 'mm',
  format: 'a4'
};

export const exportToPDF = async (expenses: Expense[], month: string, totalExpenses: number) => {
  const doc = new jsPDF(PDF_OPTIONS);
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  // Add simple text header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const title = 'AAFairShare';
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 30); // Center the title
  
  // Add report title and month
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(16);
  doc.text('Monthly Expense Summary', margin, 45);
  
  // Add month and total in a cleaner format
  doc.setFontSize(12);
  const monthDate = new Date(month + '-01');
  const monthText = `Month: ${monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
  const totalText = `Total: £${totalExpenses.toFixed(2)}`;
  
  doc.text(monthText, margin, 60);
  doc.text(totalText, pageWidth - margin - doc.getTextWidth(totalText), 60);
  
  // Fetch categories and locations data
  const { categoryMap, locationMap } = await getSupabaseData();
  
  // Define table columns and widths - All expense details in one row
  const columns = [
    { header: 'Date', width: 20 },
    { header: 'Category', width: 25 },
    { header: 'Location', width: 30 },
    { header: 'Description', width: 35 },
    { header: 'Paid By', width: 25 },
    { header: 'Split', width: 20 },
    { header: 'Amount', width: 20 }
  ];
  
  let y = 75; // Start table lower to accommodate header
  const rowHeight = 12; // Increased row height for better readability
  
  // Draw table header
  doc.setFillColor(51, 51, 51); // Darker header to match UI
  doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  let x = margin + 2; // Add padding from left
  
  columns.forEach(col => {
    doc.text(col.header, x, y + 7);
    x += col.width;
  });
  
  y += rowHeight;
  
  // Draw expense rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(8);
  
  expenses.forEach((expense, index) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
      
      // Redraw header on new page
      doc.setFillColor(51, 51, 51);
      doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      let headerX = margin + 2;
      columns.forEach(col => {
        doc.text(col.header, headerX, y + 7);
        headerX += col.width;
      });
      y += rowHeight;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(33, 33, 33);
    }
    
    // Alternate row colors for better readability
    if (index % 2 === 0) {
      doc.setFillColor(240, 240, 240);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');
    
    x = margin + 2; // Add padding from left
    
    // Date
    doc.text(new Date(expense.date).toLocaleDateString('en-GB'), x, y + 7);
    x += columns[0].width;
    
    // Category
    doc.text(categoryMap.get(expense.category_id) || 'Unknown', x, y + 7);
    x += columns[1].width;
    
    // Location
    doc.text(locationMap.get(expense.location_id) || 'Unknown', x, y + 7);
    x += columns[2].width;
    
    // Description/Notes
    const notes = expense.notes || '-';
    doc.text(notes.length > 25 ? notes.substring(0, 22) + '...' : notes, x, y + 7);
    x += columns[3].width;
    
    // Paid By
    doc.text(expense.users.name, x, y + 7);
    x += columns[4].width;
    
    // Split Type
    doc.text(expense.split_type, x, y + 7);
    x += columns[5].width;
    
    // Amount - Right aligned
    const amountText = `£${expense.amount.toFixed(2)}`;
    doc.text(amountText, x + columns[6].width - 4 - doc.getTextWidth(amountText), y + 7);
    
    y += rowHeight;
  });
  
  // Save the PDF and record the export
  const pdfContent = doc.output();
  const fileName = `expenses-${month}.pdf`;
  
  try {
    await recordExport({
      format: 'pdf',
      month,
      fileName,
      fileData: pdfContent
    });
  } catch (error) {
    console.error('Failed to record export:', error);
    // Continue with saving even if recording fails
  }

  doc.save(fileName);
  return fileName; // Return filename for confirmation
};