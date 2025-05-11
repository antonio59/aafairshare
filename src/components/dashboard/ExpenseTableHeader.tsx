
interface ExpenseTableHeaderProps {
  isMobile?: boolean;
}

const ExpenseTableHeader = ({ isMobile }: ExpenseTableHeaderProps) => {
  return (
    <thead>
      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3 border-b">Date</th>
        <th className="px-4 py-3 border-b">Category/Location</th>
        {!isMobile && <th className="px-4 py-3 border-b">Description</th>}
        <th className="px-4 py-3 border-b">Amount</th>
        <th className="px-4 py-3 border-b">Paid By</th>
        {!isMobile && <th className="px-4 py-3 border-b">Split</th>}
        <th className="px-4 py-3 border-b">Actions</th>
      </tr>
    </thead>
  );
};

export default ExpenseTableHeader;
