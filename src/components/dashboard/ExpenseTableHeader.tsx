
const ExpenseTableHeader = () => {
  return (
    <thead>
      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-6 py-3 border-b">Date</th>
        <th className="px-6 py-3 border-b">Category/Location</th>
        <th className="px-6 py-3 border-b">Description</th>
        <th className="px-6 py-3 border-b">Amount</th>
        <th className="px-6 py-3 border-b">Paid By</th>
        <th className="px-6 py-3 border-b">Split</th>
        <th className="px-6 py-3 border-b">Actions</th>
      </tr>
    </thead>
  );
};

export default ExpenseTableHeader;
