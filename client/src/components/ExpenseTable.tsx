import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pencil, Trash } from "lucide-react";
import { ExpenseWithDetails } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Tooltip } from "@/components/ui/tooltip";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface ExpenseTableProps {
  expenses: ExpenseWithDetails[];
  onEdit: (expense: ExpenseWithDetails) => void;
  isLoading?: boolean;
}

export default function ExpenseTable({ expenses, onEdit, isLoading = false }: ExpenseTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseWithDetails | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(expenses.length / itemsPerPage);
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

  // Calculate current items to display based on pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, expenses.length);
  const currentExpenses = expenses.slice(startIndex, endIndex);

  // Navigation functions
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Logic to show a reasonable number of page links
    if (totalPages <= maxPagesToShow) {
      // If we have 5 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate middle pages to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }
      
      // Add ellipsis if there's a gap after page 1
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if there's a gap before the last page
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {currentExpenses.map(expense => (
          <div 
            key={expense.id} 
            className="p-4 rounded-lg bg-card dark:bg-card border border-border dark:border-border shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-3">
                <div className="rounded-full h-11 w-11 flex items-center justify-center touch-target" 
                     style={{ backgroundColor: `${expense.category.color}20` }}>
                  <div className="text-base font-bold" style={{ color: expense.category.color, textShadow: '0px 0px 1px rgba(0,0,0,0.15)' }}>
                    {expense.category?.name.substring(0, 1).toUpperCase() || 'U'}
                  </div>
                </div>
                <div style={{ maxWidth: 'calc(100vw - 160px)' }}>
                  <p className="text-base font-bold truncate" style={{ color: expense.category.color, textShadow: '0px 0px 1px rgba(0,0,0,0.15)' }}>
                    {expense.category?.name || 'Uncategorized'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {expense.location?.name || 'No location'}
                  </p>
                  {expense.description && (
                    <p className="text-xs text-muted-foreground truncate italic mt-1">
                      {expense.description}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-base font-bold text-foreground whitespace-nowrap pl-2">
                {formatCurrency(Number(expense.amount))}
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border dark:border-border">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground truncate mr-1">
                    {expense.paidByUser.username.split(' ')[0]} • {expense.split_type.replace('SPLIT_', '')}
                  </span>
                  <Tooltip 
                    content={`Paid by ${expense.paidByUser.username}, split ${expense.split_type}`}
                    position="top"
                  >
                    <span className="text-xs text-muted-foreground cursor-pointer">
                      ℹ️
                    </span>
                  </Tooltip>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEdit(expense)}
                  className="h-10 w-10 p-0 rounded-full touch-target"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => openDeleteDialog(expense)}
                  className="h-10 w-10 p-0 rounded-full text-destructive touch-target"
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
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
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-[100px] lg:w-[120px] whitespace-nowrap">Amount</TableHead>
                <TableHead className="w-[100px] whitespace-nowrap">Paid By</TableHead>
                <TableHead className="w-[80px] whitespace-nowrap">Split</TableHead>
                <TableHead className="w-[80px] lg:w-[100px] whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentExpenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(expense.date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-bold financial-text" style={{ color: expense.category.color, textShadow: '0px 0px 1px rgba(0,0,0,0.15)' }}>{expense.category?.name || 'Uncategorized'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{expense.location?.name || 'No location'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-gray-600 dark:text-gray-300">
                    {expense.description || '-'}
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
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => goToPage(currentPage - 1)}
                    className="cursor-pointer" 
                  />
                </PaginationItem>
              )}
              
              {getPageNumbers().map((page, index) => (
                page < 0 ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <div className="flex h-9 w-9 items-center justify-center">...</div>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => goToPage(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => goToPage(currentPage + 1)}
                    className="cursor-pointer" 
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            Showing {startIndex + 1}-{endIndex} of {expenses.length} expenses
          </div>
        </div>
      )}

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