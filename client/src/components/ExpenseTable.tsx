import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseWithDetails } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface ExpenseTableProps {
  expenses: ExpenseWithDetails[];
  onEdit: (expense: ExpenseWithDetails) => void;
  isLoading?: boolean;
}

export default function ExpenseTable({ expenses, onEdit, isLoading = false }: ExpenseTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseWithDetails | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await apiRequest(`/api/expenses/${expenseToDelete.id}`, 'DELETE');

      toast({
        title: "Expense deleted",
        description: "The expense has been deleted successfully.",
      });

      // Get the month of the deleted expense to invalidate the correct queries
      const month = expenseToDelete.date 
        ? new Date(expenseToDelete.date).toISOString().substring(0, 7) 
        : new Date().toISOString().substring(0, 7);
      
      // Invalidate queries with the proper query key patterns
      queryClient.invalidateQueries({ queryKey: [`/api/expenses?month=${month}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/summary/${month}`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const openDeleteDialog = (expense: ExpenseWithDetails) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  // Display loading state or empty state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-600">No expenses found for this period.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border-gray-200 w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[100px] lg:w-[120px] whitespace-nowrap">Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-[100px] lg:w-[120px] whitespace-nowrap">Amount</TableHead>
                <TableHead className="hidden sm:table-cell w-[100px] whitespace-nowrap">Paid By</TableHead>
                <TableHead className="hidden sm:table-cell w-[80px] whitespace-nowrap">Split</TableHead>
                <TableHead className="w-[80px] lg:w-[100px] whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">{formatDate(expense.date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="ml-2 sm:ml-3">
                        <p className="text-xs sm:text-sm font-medium text-gray-800" style={{ color: expense.category.color }}>{expense.category?.name || 'Uncategorized'}</p>
                        <p className="text-xs text-gray-500">{expense.location?.name || 'No location'}</p>
                        <div className="sm:hidden text-xs text-gray-500 flex flex-col">
                          <span>{expense.paidByUser.username}</span>
                          <span>{expense.split_type}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm font-medium text-gray-800 whitespace-nowrap">{formatCurrency(Number(expense.amount))}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-gray-600">{expense.paidByUser.username}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-gray-600">{expense.split_type}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1 sm:space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(expense)}
                        className="text-gray-500 hover:text-primary h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openDeleteDialog(expense)}
                        className="text-gray-500 hover:text-red-500 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}