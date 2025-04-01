import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// Removed unused Badge import
// import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
// Removed unused Expense type import
import { type ExpenseWithDetails, type User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface ExpenseTableProps {
  expenses: ExpenseWithDetails[];
  users?: User[]; // Keep users in props definition for API consistency
  onEdit: (expense: ExpenseWithDetails) => void;
  onDelete: (expense: ExpenseWithDetails) => void;
  isLoading: boolean;
}

// Skeleton Card for loading state on mobile (Updated Layout v2)
const ExpenseCardSkeleton = () => (
  <div className="block border rounded-md p-3 mb-3 md:hidden">
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <Skeleton className="h-4 w-28" /> {/* Category */}
        <Skeleton className="h-5 w-24" /> {/* Amount */}
      </div>
      <Skeleton className="h-3 w-20 mb-1" /> {/* Location */}
      <Skeleton className="h-4 w-full mb-2" /> {/* Description */}
      <div className="flex justify-between items-center text-xs">
        <div className="space-y-1">
          <Skeleton className="h-3 w-24" /> {/* Paid By */}
          <Skeleton className="h-3 w-16" /> {/* Split */}
          <Skeleton className="h-3 w-20" /> {/* Date */}
        </div>
        <div className="flex space-x-1">
          <Skeleton className="h-7 w-7 rounded-md" /> {/* Edit */}
          <Skeleton className="h-7 w-7 rounded-md" /> {/* Delete */}
        </div>
      </div>
    </div>
  </div>
);

// Removed unused 'users' from props destructuring
export function ExpenseTable({ expenses, onEdit, onDelete, isLoading }: ExpenseTableProps) {

  return (
    <div className="w-full">
      {/* Desktop Table View (hidden on small screens) */}
      <div className="hidden md:block border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category/Location</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Paid By</TableHead>
              <TableHead>Split</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading expenses...
                </TableCell>
              </TableRow>
            ) : expenses.length > 0 ? (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="py-2 px-3 text-xs">{formatDate(expense.date)}</TableCell>
                  <TableCell className="py-2 px-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span
                        style={{ color: expense.category?.color || 'inherit' }}
                        className="text-xs font-medium"
                      >
                        {expense.category?.name || "Uncategorized"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {expense.location?.name || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-xs">{expense.description || "-"}</TableCell>
                  <TableCell className="py-2 px-3 text-xs text-right font-medium">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-xs">
                    {expense.paidByUser?.username ?? "-"}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-xs">{expense.splitType || "50/50"}</TableCell>
                  <TableCell className="py-2 px-1 text-xs">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(expense)}
                        className="h-7 w-7 hover:bg-background"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(expense)}
                        className="h-7 w-7 hover:bg-background text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No expenses found for this period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View (visible on small screens) - Updated Layout v3 */}
      <div className="md:hidden space-y-2"> {/* Reduced gap between cards */}
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => <ExpenseCardSkeleton key={index} />)
        ) : expenses.length > 0 ? (
          expenses.map((expense) => (
            <div key={expense.id} className="block border rounded-md p-3">
              {/* Top Row: Category/Location and Amount */}
              <div className="flex justify-between items-start mb-1">
                <div className="flex flex-col text-xs">
                  <span style={{ color: expense.category?.color || 'inherit' }} className="font-medium text-sm text-foreground"> {/* Made category stand out */}
                    {expense.category?.name || "Uncategorized"}
                  </span>
                  <span className="text-muted-foreground">{expense.location?.name || "-"}</span>
                </div>
                <div className="text-base font-semibold text-right">{formatCurrency(expense.amount)}</div>
              </div>

              {/* Description Row (Conditional) */}
              {expense.description && (
                <div className="text-sm mb-2 truncate" title={expense.description}>
                  {expense.description}
                </div>
              )}

              {/* Bottom Row: PaidBy/Split/Date and Actions */}
              <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-1.5 mt-1.5">
                <div>
                  <span>Paid by: {expense.paidByUser?.username ?? "-"}</span>
                  <span className="mx-1.5">•</span> {/* Separator */}
                  <span>Split: {expense.splitType || "50/50"}</span>
                  <span className="mx-1.5">•</span> {/* Separator */}
                  <span>{formatDate(expense.date)}</span> {/* Moved Date here */}
                </div>
                <div className="flex space-x-0"> {/* Reduced space for buttons */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(expense)}
                    className="h-7 w-7"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(expense)}
                    className="h-7 w-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-10">
            No expenses found for this period.
          </div>
        )}
      </div>

      {/* Total Count (Optional - maybe move to parent component) */}
      {!isLoading && expenses.length > 0 && (
        <div className="text-sm text-muted-foreground mt-4">
          Total: {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
