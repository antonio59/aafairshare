
import { useState, useEffect } from "react";
import { Expense, User } from "@/types";
import { format } from "date-fns";
import { getUsers, updateExpense, deleteExpense } from "@/services/expenseService";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

// Import our new components
import UserAvatar from "./expense-row/UserAvatar";
import ExpenseRowActions from "./expense-row/ExpenseRowActions";
import EditExpenseDialog from "./expense-row/EditExpenseDialog";
import DeleteExpenseDialog from "./expense-row/DeleteExpenseDialog";

interface ExpenseTableRowProps {
  expense: Expense;
}

const ExpenseTableRow = ({ expense }: ExpenseTableRowProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedExpense, setEditedExpense] = useState<Expense>(expense);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  // Create a proper User object with all required properties
  const user: User = users.find(user => user.id === expense.paidBy) || {
    id: 'unknown', // Add the required id property for the fallback
    name: "Unknown User",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=unknown`
  };

  const handleEdit = () => {
    setEditedExpense({...expense});
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      // Keep the original paidBy
      await updateExpense(expense.id, {
        ...editedExpense,
        paidBy: expense.paidBy
      });
      setIsEditing(false);
      toast({
        title: "Expense updated",
        description: "Your expense has been updated successfully.",
      });
      // Invalidate and refetch the month data query to update the UI
      queryClient.invalidateQueries({ queryKey: ["monthData"] });
    } catch (error) {
      console.error("Failed to update expense:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the expense.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedExpense(expense);
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await deleteExpense(expense.id);
      setIsDeleting(false);
      toast({
        title: "Expense deleted",
        description: "Your expense has been deleted successfully.",
      });
      // Invalidate and refetch the month data query to update the UI
      queryClient.invalidateQueries({ queryKey: ["monthData"] });
    } catch (error) {
      console.error("Failed to delete expense:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the expense.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format split type for display
  const displaySplitType = expense.split === "custom" || expense.split === "100%" 
    ? "Other pays full" 
    : "Split 50/50";

  return (
    <>
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
          <UserAvatar user={user} />
        </td>
        <td className="px-6 py-4">{displaySplitType}</td>
        <td className="px-6 py-4">
          <ExpenseRowActions 
            onEdit={handleEdit} 
            onDelete={() => setIsDeleting(true)} 
          />
        </td>
      </tr>

      {/* Edit Dialog */}
      <EditExpenseDialog
        isOpen={isEditing}
        onClose={handleCancel}
        expense={expense}
        editedExpense={editedExpense}
        setEditedExpense={setEditedExpense}
        user={user}
        isSubmitting={isSubmitting}
        handleSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteExpenseDialog
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default ExpenseTableRow;
