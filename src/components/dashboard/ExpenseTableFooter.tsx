
interface ExpenseTableFooterProps {
  count: number;
}

const ExpenseTableFooter = ({ count }: ExpenseTableFooterProps) => {
  return (
    <div className="p-4 border-t text-sm text-gray-500">
      Total: {count} {count === 1 ? 'expense' : 'expenses'}
    </div>
  );
};

export default ExpenseTableFooter;
