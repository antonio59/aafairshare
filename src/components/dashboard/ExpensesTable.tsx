
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Expense } from "@/types";

interface ExpensesTableProps {
  expenses: Expense[] | undefined;
  searchTerm: string;
}

const ExpensesTable = ({ expenses, searchTerm }: ExpensesTableProps) => {
  // Filter expenses based on search term
  const filteredExpenses = expenses?.filter((expense) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      expense.category.toLowerCase().includes(searchTermLower) ||
      expense.location.toLowerCase().includes(searchTermLower) ||
      expense.description?.toLowerCase().includes(searchTermLower) ||
      (expense.paidBy === "1" ? "antonio" : "andres").includes(searchTermLower)
    );
  });

  return (
    <>
      <table className="min-w-full">
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
        <tbody>
          {filteredExpenses && filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {format(new Date(expense.date), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{expense.category}</div>
                  <div className="text-sm text-gray-500">{expense.location}</div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {expense.description || "-"}
                </td>
                <td className="px-6 py-4 font-medium">
                  £{expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  {expense.paidBy === "1" ? "Antonio" : "Andres"}
                </td>
                <td className="px-6 py-4">{expense.split}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                {searchTerm ? "No matching expenses found." : "No expenses found for this month."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="p-4 border-t text-sm text-gray-500">
        Total: {filteredExpenses?.length || 0} expenses
      </div>
    </>
  );
};

export default ExpensesTable;
