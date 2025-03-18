import { jsPDF } from 'jspdf';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Expense {
  id: string;
  amount: number;
  category_id: string;
  location_id: string;
  notes: string;
  date: string;
  paid_by: string;
  split_type: 'Equal' | 'No Split';
  users: {
    name: string;
  }
  created_at: string;
}

export const exportToCSV = async (expenses: Expense[], month: string) => {
  const supabase = createClientComponentClient();
  const headers = ['Date', 'Amount', 'Category', 'Location', 'Notes', 'Paid By', 'Split Type'];
  const rows = expenses.map(expense => [
    expense.date,
    `£${expense.amount.toFixed(2)}`,
    expense.category_id,
    expense.location_id,
    expense.notes,
    expense.users.name,
    expense.split_type
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8-sig' });
  const fileName = `expenses-${month}.csv`;
  
  // Record the export in the exports table
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('exports').insert({
    user_id: user?.id,
    data_type: 'expenses',
    format: 'csv',
    filters: { month },
    file_name: fileName,
    file_data: csvContent,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.setAttribute('type', 'text/csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const exportToPDF = async (expenses: Expense[], month: string, totalExpenses: number) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  
  // Add branding header with gradient effect
  const gradient = doc.setFillColor(59, 130, 246); // Primary blue
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Add logo and title with improved positioning
  const logoSvg = await fetch('/logo.svg').then(res => res.text());
  doc.addSvgAsImage(logoSvg, margin, 20, 24, 24);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('AAFairShare', 45, 30);
  
  // Reset text color for content
  doc.setTextColor(33, 33, 33); // Dark gray for better readability
  
  // Add report summary section
  doc.setFillColor(243, 244, 246); // Light gray background
  doc.rect(margin, 60, pageWidth - 2 * margin, 40, 'F');
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Expense Summary', margin + 5, 75);
  
  doc.setFontSize(14);
  const monthDate = new Date(month + '-01');
  doc.text(`Month: ${monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`, margin + 5, 90);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`Total: £${totalExpenses.toFixed(2)}`, pageWidth - margin - 60, 90, { align: 'right' });
  
  interface Category {
    id: string;
    category: string;
  }

  interface Location {
    id: string;
    location: string;
  }

  // Fetch categories and locations data
  const [categoriesRes, locationsRes] = await Promise.all([
    fetch('/api/categories'),
    fetch('/api/locations')
  ]);
  const categories: Category[] = await categoriesRes.json();
  const locations: Location[] = await locationsRes.json();
  
  const categoryMap = new Map(categories.map((c: Category) => [c.id, c.category]));
  const locationMap = new Map(locations.map((l: Location) => [l.id, l.location]));
  
  // Group expenses by category
  const expensesByCategory = expenses.reduce<Record<string, Expense[]>>((acc, expense) => {
    const category = categoryMap.get(expense.category_id) || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(expense);
    return acc;
  }, {});
  
  let y = 120;
  const rowHeight = 12;
  
  // Draw category sections
  Object.entries(expensesByCategory).forEach(([category, categoryExpenses]) => {
    // Add new page if needed
    if (y > pageHeight - 60) {
      doc.addPage();
      y = margin;
    }
    
    // Category header with icon-like visual
    doc.setFillColor(59, 130, 246, 0.1); // Light blue background
    doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F');
    
    // Category icon (circle with first letter)
    doc.setFillColor(59, 130, 246);
    doc.circle(margin + 10, y + 12.5, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(category.charAt(0).toUpperCase(), margin + 10, y + 12.5, { align: 'center' });
    
    // Category name and total
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(14);
    doc.text(category, margin + 25, y + 16);
    
    const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    doc.text(`£${categoryTotal.toFixed(2)}`, pageWidth - margin - 30, y + 16, { align: 'right' });
    
    y += 35;
    
    // Column headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date', margin + 5, y);
    doc.text('Location', margin + 50, y);
    doc.text('Paid By', margin + 120, y);
    doc.text('Amount', pageWidth - margin - 30, y, { align: 'right' });
    
    y += rowHeight + 5;
    
    // Expense details
    doc.setFont('helvetica', 'normal');
    categoryExpenses.forEach(expense => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }
      
      // Expense row with alternating background
      if (categoryExpenses.indexOf(expense) % 2 === 0) {
        doc.setFillColor(249, 250, 251); // Very light gray
        doc.rect(margin, y - 5, pageWidth - 2 * margin, rowHeight + 5, 'F');
      }
      
      doc.text(new Date(expense.date).toLocaleDateString(), margin + 5, y);
      doc.text(locationMap.get(expense.location_id) || 'Unknown', margin + 50, y);
      doc.text(expense.users.name, margin + 120, y);
      doc.text(`£${expense.amount.toFixed(2)}`, pageWidth - margin - 30, y, { align: 'right' });
      
      if (expense.notes) {
        y += rowHeight;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text(`Note: ${expense.notes}`, margin + 5, y);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
      }
      
      y += rowHeight + 8;
    });
    
    y += 20;
  });
  
  // Add footer with export info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated on ${new Date().toLocaleString()}`, margin, pageHeight - 10);
  
  // Save the PDF and record the export
  const pdfContent = doc.output();
  const fileName = `expenses-${month}.pdf`;
  
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('exports').insert({
    user_id: user?.id,
    data_type: 'expenses',
    format: 'pdf',
    filters: { month },
    file_name: fileName,
    file_data: pdfContent,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  doc.save(fileName);
}