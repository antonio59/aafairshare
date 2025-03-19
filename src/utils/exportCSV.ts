import { Expense, getSupabaseData, recordExport } from './types';

export const exportToCSV = async (expenses: Expense[], month: string) => {
  const { categoryMap, locationMap } = await getSupabaseData();

  const headers = ['Date', 'Amount', 'Category', 'Location', 'Notes', 'Paid By', 'Split Type'];
  const rows = expenses.map(expense => [
    new Date(expense.date).toLocaleDateString('en-GB'),
    `£${expense.amount.toFixed(2)}`,
    categoryMap.get(expense.category_id) || 'Unknown',
    locationMap.get(expense.location_id) || 'Unknown',
    expense.notes,
    expense.users.name,
    expense.split_type
  ]);

  // Calculate totals and settlements
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const userExpenses = new Map();
  expenses.forEach(exp => {
    const amount = exp.split_type === 'Equal' ? exp.amount / 2 : exp.amount;
    userExpenses.set(exp.users.name, (userExpenses.get(exp.users.name) || 0) + amount);
  });

  // Add empty row and summary section
  rows.push([]);
  rows.push(['Summary']);
  rows.push(['Total Expenses', `£${total.toFixed(2)}`]);
  rows.push([]);
  rows.push(['Settlements']);
  for (const [user, amount] of userExpenses.entries()) {
    rows.push([user, `£${amount.toFixed(2)}`]);
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8-sig' });
  const fileName = `expenses-${month}.csv`;
  
  // Record the export
  await recordExport({
    format: 'csv',
    month,
    fileName,
    fileData: csvContent
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
};