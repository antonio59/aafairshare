
import { useState, useEffect } from "react";
import { Pencil, Trash, X, Check, AlertCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

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
      // Ensure we don't change the paidBy field
      await updateExpense(expense.id, {
        ...editedExpense,
        paidBy: expense.paidBy // Keep original user who paid
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

  // Mobile editing dialog
  if (isMobile && isEditing) {
    return (
      <>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4" colSpan={7}>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              Editing...
            </Button>
          </td>
        </tr>
        
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="date" className="text-sm font-medium">Date</label>
                <Input 
                  id="date"
                  type="date" 
                  value={editedExpense.date} 
                  onChange={(e) => setEditedExpense({...editedExpense, date: e.target.value})}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Input 
                  id="category"
                  type="text" 
                  value={editedExpense.category} 
                  onChange={(e) => setEditedExpense({...editedExpense, category: e.target.value})}
                  className="col-span-3"
                  placeholder="Category"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <Input 
                  id="location"
                  type="text" 
                  value={editedExpense.location} 
                  onChange={(e) => setEditedExpense({...editedExpense, location: e.target.value})}
                  className="col-span-3"
                  placeholder="Location"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Input 
                  id="description"
                  type="text" 
                  value={editedExpense.description || ''} 
                  onChange={(e) => setEditedExpense({...editedExpense, description: e.target.value})}
                  className="col-span-3"
                  placeholder="Description"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="amount" className="text-sm font-medium">Amount (£)</label>
                <Input 
                  id="amount"
                  type="number" 
                  value={editedExpense.amount} 
                  onChange={(e) => setEditedExpense({...editedExpense, amount: parseFloat(e.target.value)})}
                  className="col-span-3"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="split" className="text-sm font-medium">Split</label>
                <Select 
                  value={editedExpense.split} 
                  onValueChange={(value) => setEditedExpense({...editedExpense, split: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select split type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50/50">50/50</SelectItem>
                    <SelectItem value="custom">100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-sm font-medium">Paid by</label>
                <div className="col-span-3 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (isEditing && !isMobile) {
    return (
      <tr className="bg-blue-50">
        <td className="px-6 py-2">
          <Input 
            type="date" 
            value={editedExpense.date} 
            onChange={(e) => setEditedExpense({...editedExpense, date: e.target.value})}
            className="h-8"
          />
        </td>
        <td className="px-6 py-2">
          <Input 
            type="text" 
            value={editedExpense.category} 
            onChange={(e) => setEditedExpense({...editedExpense, category: e.target.value})}
            className="h-8 mb-1"
            placeholder="Category"
          />
          <Input 
            type="text" 
            value={editedExpense.location} 
            onChange={(e) => setEditedExpense({...editedExpense, location: e.target.value})}
            className="h-8"
            placeholder="Location"
          />
        </td>
        <td className="px-6 py-2">
          <Input 
            type="text" 
            value={editedExpense.description || ''} 
            onChange={(e) => setEditedExpense({...editedExpense, description: e.target.value})}
            className="h-8"
            placeholder="Description"
          />
        </td>
        <td className="px-6 py-2">
          <Input 
            type="number" 
            value={editedExpense.amount} 
            onChange={(e) => setEditedExpense({...editedExpense, amount: parseFloat(e.target.value)})}
            className="h-8"
            step="0.01"
          />
        </td>
        <td className="px-6 py-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
          </div>
        </td>
        <td className="px-6 py-2">
          <Select 
            value={editedExpense.split} 
            onValueChange={(value) => setEditedExpense({...editedExpense, split: value})}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select split type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50/50">50/50</SelectItem>
              <SelectItem value="custom">100%</SelectItem>
            </SelectContent>
          </Select>
        </td>
        <td className="px-6 py-2">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSave} disabled={isSubmitting}>
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  }

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
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
