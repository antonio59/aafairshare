import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
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
      <div className="bg-white dark:bg-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-base">No expenses found for this period.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="sm:hidden">
        {expenses.map(expense => (
          <div 
            key={expense.id} 
            className="bg-white dark:bg-card border-b border-gray-200 dark:border-gray-800 overflow-hidden last:border-b-0"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="max-w-[70%]">
                  <p className="text-base font-medium truncate financial-text" style={{ color: expense.category.color }}>
                    {expense.category?.name || 'Uncategorized'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{expense.location?.name || 'No location'}</p>
                </div>
                <p className="text-base font-semibold whitespace-nowrap financial-value">{formatCurrency(Number(expense.amount))}</p>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(expense.date)}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                    {expense.paidByUser.username} • {expense.split_type}
                  </span>
                </div>
                <div className="flex space-x-2 ml-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(expense)}
                    className="text-gray-500 hover:text-primary h-8 w-8 p-0 touch-target"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openDeleteDialog(expense)}
                    className="text-gray-500 hover:text-red-500 h-8 w-8 p-0 touch-target"
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white dark:bg-card rounded-lg shadow-sm border-gray-200 dark:border-gray-800 w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/40">
              <TableRow>
                <TableHead className="w-[100px] lg:w-[120px] whitespace-nowrap">Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-[100px] lg:w-[120px] whitespace-nowrap">Amount</TableHead>
                <TableHead className="w-[100px] whitespace-nowrap">Paid By</TableHead>
                <TableHead className="w-[80px] whitespace-nowrap">Split</TableHead>
                <TableHead className="w-[80px] lg:w-[100px] whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(expense.date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium financial-text" style={{ color: expense.category.color }}>{expense.category?.name || 'Uncategorized'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{expense.location?.name || 'No location'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-800 dark:text-white whitespace-nowrap financial-value">{formatCurrency(Number(expense.amount))}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-300">{expense.paidByUser.username}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-300">{expense.split_type}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(expense)}
                        className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openDeleteDialog(expense)}
                        className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 h-8 w-8 p-0"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
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