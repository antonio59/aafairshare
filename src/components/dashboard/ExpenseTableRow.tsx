
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Expense } from "@/types";

interface ExpenseTableRowProps {
  expense: Expense;
}

const ExpenseTableRow = ({ expense }: ExpenseTableRowProps) => {
  return (
    <tr className="hover:bg-gray-50">
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
  );
};

export default ExpenseTableRow;
