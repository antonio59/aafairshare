
import { useState, useEffect } from "react";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Expense, User } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { getUsers } from "@/services/expenseService";

interface ExpenseTableRowProps {
  expense: Expense;
}

const ExpenseTableRow = ({ expense }: ExpenseTableRowProps) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    
    fetchUsers();
  }, []);

  // Find the user who paid for this expense
  const user = users.find(user => user.id === expense.paidBy) || {
    name: "Unknown User",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=unknown`
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
            <AvatarImage src={user.avatar} alt={user.name} />
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
