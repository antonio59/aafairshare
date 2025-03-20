import PDFDocument from 'pdfkit';
import { Expense, getSupabaseData, recordExport } from './types';

export const exportToPDF = async (expenses: Expense[], month: string, totalExpenses: number, settlement?: { from: string; to: string; amount: number }) => {
  const doc = new PDFDocument({ size: 'A4' });
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 15;
  
  // Add simple text header
  doc.fontSize(24);
  doc.font('Helvetica-Bold');
  const title = 'AAFairShare';
  const titleWidth = doc.widthOfString(title);
  doc.text(title, (pageWidth - titleWidth) / 2, margin, { align: 'center', continued: false }); // Center the title
  
  // Add report title and month
  doc.fillColor('#212121');
  doc.fontSize(16);
  doc.text('Monthly Expense Summary', margin, margin + 30, { align: 'left', continued: false });
  
  // Add month and total in a cleaner format
  doc.fontSize(12);
  const monthDate = new Date(month + '-01');
  const monthText = `Month: ${monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
  const totalText = `Total: £${totalExpenses.toFixed(2)}`;
  
  doc.text(monthText, margin, margin + 50, { align: 'left', continued: false });
  doc.text(totalText, pageWidth - margin - doc.widthOfString(totalText), margin + 50, { align: 'right', continued: false });

  // Initialize y coordinate for table position
  let y = 75;
  
  // Add settlement information if available
  if (settlement) {
    doc.fontSize(12);
    doc.font('Helvetica-Bold');
    doc.text('Settlement Summary', margin, margin + 70, { align: 'left', continued: false });
    
    doc.font('Helvetica');
    const settlementText = `${settlement.from} owes ${settlement.to} £${settlement.amount.toFixed(2)}`;
    doc.text(settlementText, margin, margin + 80, { align: 'left', continued: false });
    
    y = 95; // Adjust starting position for expense table
  }
  
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
  const rowHeight = 12; // Increased row height for better readability
  
  // Draw table header
  doc.fillColor('#333333'); // Darker header to match UI
  doc.rect(margin, y, pageWidth - 2 * margin, rowHeight).fill();
  
  doc.font('Helvetica-Bold');
  doc.fontSize(9);
  doc.fillColor('#FFFFFF');
  let x = margin + 2; // Add padding from left
  
  columns.forEach(col => {
    doc.text(col.header, x, y + 2, { align: 'left', continued: false });
    x += col.width;
  });
  
  y += rowHeight;
  
  // Draw expense rows
  doc.font('Helvetica');
  doc.fillColor('#212121');
  doc.fontSize(8);
  
  expenses.forEach((expense: Expense, index) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
      
      // Redraw header on new page
      doc.fillColor('#333333');
      doc.rect(margin, y, pageWidth - 2 * margin, rowHeight).fill();
      doc.font('Helvetica-Bold');
      doc.fontSize(9);
      doc.fillColor('#FFFFFF');
      
      x = margin + 2;
      columns.forEach(col => {
        doc.text(col.header, x, y + 2, { align: 'left', continued: false });
        x += col.width;
      });
      
      y += rowHeight;
      doc.font('Helvetica');
      doc.fontSize(8);
      doc.fillColor('#212121');
    }
    
    // Alternate row colors for better readability
    doc.fillColor(index % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
    doc.rect(margin, y, pageWidth - 2 * margin, rowHeight).fill();
    
    doc.fillColor('#212121');
    x = margin + 2; // Add padding from left
    
    // Date
    doc.text(new Date(expense.date).toLocaleDateString('en-GB'), x, y + 2, { align: 'left', continued: false });
    x += columns[0].width;
    
    // Category
    doc.text((categoryMap.get(expense.category_id) || 'Unknown').toString(), x, y + 2, { align: 'left', continued: false });
    x += columns[1].width;
    
    // Location
    doc.text((locationMap.get(expense.location_id) || 'Unknown').toString(), x, y + 2, { align: 'left', continued: false });
    x += columns[2].width;
    
    // Description/Notes
    const notes = expense.notes || '-';
    doc.text(notes.length > 25 ? notes.substring(0, 22) + '...' : notes, x, y + 2, { align: 'left', continued: false });
    x += columns[3].width;
    
    // Paid By
    doc.text(expense.users.name, x, y + 2, { align: 'left', continued: false });
    x += columns[4].width;
    
    // Split Type
    doc.text(expense.split_type, x, y + 2, { align: 'left', continued: false });
    x += columns[5].width;
    
    // Amount - Right aligned using absolute positioning
    const amountText = `£${expense.amount.toFixed(2)}`;
    const amountWidth = doc.widthOfString(amountText);
    doc.text(amountText, x + columns[6].width - amountWidth, y + 2, { align: 'right', continued: false });
    
    y += rowHeight;
  });
  
  // Create a buffer to store the PDF content
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  
  return new Promise<string>((resolve, reject) => {
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      const fileName = `expenses-${month}.pdf`;
      
      try {
        await recordExport({
          format: 'pdf',
          month,
          fileName,
          fileData: pdfBuffer.toString('base64')
        });
        
        // Create a Blob and download the file
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        resolve(fileName);
      } catch (error) {
        console.error('Failed to record export:', error);
        // Continue with saving even if recording fails
        resolve(fileName);
      }
    });
    
    doc.on('error', reject);
    doc.end();
  });
};