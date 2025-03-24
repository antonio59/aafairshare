import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RecurringExpenseWithDetails } from "@shared/schema";
import { Pencil, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface RecurringExpenseTableProps {
  recurringExpenses: RecurringExpenseWithDetails[];
  onEdit: (recurringExpense: RecurringExpenseWithDetails) => void;
  onDeleted: () => void;
  isLoading?: boolean;
}

// Function to get appropriate frequency label
const getFrequencyLabel = (frequency: string): string => {
  const labels: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Biweekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly"
  };
  return labels[frequency] || frequency;
};

export default function RecurringExpenseTable({ 
  recurringExpenses, 
  onEdit, 
  onDeleted,
  isLoading = false 
}: RecurringExpenseTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<RecurringExpenseWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open delete confirmation dialog
  const openDeleteDialog = (recurringExpense: RecurringExpenseWithDetails) => {
    setExpenseToDelete(recurringExpense);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!expenseToDelete) return;

    setIsDeleting(true);
    try {
      await apiRequest("DELETE", `/api/recurring-expenses/${expenseToDelete.id}`);
      onDeleted();
    } catch (error) {
      console.error("Error deleting recurring expense:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-9 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // If no recurring expenses, show empty state
  if (recurringExpenses.length === 0) {
    return (
      <div className="bg-background rounded-md border p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold">No recurring expenses found</h3>
        <p className="text-muted-foreground">Create a recurring expense to see it here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurringExpenses.map((recurringExpense) => (
              <TableRow key={recurringExpense.id}>
                <TableCell className="font-medium">{recurringExpense.name}</TableCell>
                <TableCell>{formatCurrency(Number(recurringExpense.amount))}</TableCell>
                <TableCell>{getFrequencyLabel(recurringExpense.frequency)}</TableCell>
                <TableCell>{formatDate(recurringExpense.next_date)}</TableCell>
                <TableCell>
                  <Badge 
                    variant={recurringExpense.is_active ? "default" : "outline"}
                  >
                    {recurringExpense.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: recurringExpense.category.color }} 
                    />
                    <span>{recurringExpense.category.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(recurringExpense)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDeleteDialog(recurringExpense)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the recurring expense
              "{expenseToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}