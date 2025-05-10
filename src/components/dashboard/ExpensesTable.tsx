
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Expense } from "@/types";
import ExpenseTableHeader from "./ExpenseTableHeader";
import ExpenseTableRow from "./ExpenseTableRow";
import ExpenseTableFooter from "./ExpenseTableFooter";

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
        <ExpenseTableHeader />
        <tbody>
          {filteredExpenses && filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <ExpenseTableRow key={expense.id} expense={expense} />
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

      <ExpenseTableFooter count={filteredExpenses?.length || 0} />
    </>
  );
};

export default ExpensesTable;
