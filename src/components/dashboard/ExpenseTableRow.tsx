
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Expense } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ExpenseTableRowProps {
  expense: Expense;
}

const ExpenseTableRow = ({ expense }: ExpenseTableRowProps) => {
  // Get the user name and photo based on paidBy value
  const user = {
    name: expense.paidBy === "1" ? "Antonio" : "Andres",
    photoUrl: expense.paidBy === "1" 
      ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio" 
      : "https://api.dicebear.com/7.x/avataaars/svg?seed=Andres"
  };

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
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.photoUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{user.name}</span>
        </div>
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
