import { useState, useEffect } from "react";
import { Pencil, Trash, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Expense, User } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { getUsers, updateExpense, deleteExpense } from "@/services/expenseService";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

// Import the same components used in AddExpense
import AmountInput from "@/components/expense/AmountInput";
import DateSelector from "@/components/expense/DateSelector";
import CategorySelector from "@/components/expense/CategorySelector";
import LocationSelector from "@/components/expense/LocationSelector";
import SplitTypeSelector from "@/components/expense/SplitTypeSelector";

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
  const isMobile = useIsMobile();

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

  // New consistent edit dialog (similar to AddExpense page)
  const renderEditDialog = () => (
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 overflow-y-auto max-h-[80vh]">
          {/* Amount */}
          <AmountInput 
            value={String(editedExpense.amount)} 
            onChange={(value) => setEditedExpense({...editedExpense, amount: parseFloat(value) || 0})} 
          />

          {/* Date */}
          <DateSelector 
            selectedDate={new Date(editedExpense.date)} 
            onChange={(date) => {
              const formattedDate = format(date, "yyyy-MM-dd");
              setEditedExpense({...editedExpense, date: formattedDate})
            }} 
          />

          {/* Category */}
          <CategorySelector 
            selectedCategory={editedExpense.category} 
            onChange={(category) => setEditedExpense({...editedExpense, category})} 
          />

          {/* Location */}
          <LocationSelector 
            selectedLocation={editedExpense.location} 
            onChange={(location) => setEditedExpense({...editedExpense, location})} 
          />

          {/* Split Type */}
          <SplitTypeSelector 
            selectedSplitType={editedExpense.split} 
            onChange={(splitType) => setEditedExpense({...editedExpense, split: splitType})} 
          />

          {/* Description */}
          <div className="mb-6">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Description (Optional)
            </label>
            <div className="mt-2">
              <Input
                type="text"
                placeholder="Add notes about this expense"
                value={editedExpense.description || ''}
                onChange={(e) => setEditedExpense({...editedExpense, description: e.target.value})}
              />
            </div>
          </div>

          {/* Paid By Information (Not Editable) */}
          <div className="mb-6">
            <label className="text-sm font-medium leading-none">Paid By</label>
            <div className="mt-2 flex items-center p-2 border rounded-md bg-gray-50">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <span>{user.name}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
          </div>
        </td>
        <td className="px-6 py-4">{expense.split === "custom" ? "100%" : expense.split}</td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleEdit}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setIsDeleting(true)}>
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>

      {/* Edit Dialog */}
      {renderEditDialog()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExpenseTableRow;
