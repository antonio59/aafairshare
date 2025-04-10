import React, { useState } from "react";
import { ExpenseWithDetails, User } from "~/shared/schema";
import { formatCurrency, formatDate } from "~/lib/utils";
import { getCategoryColor } from "~/lib/chartColors";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import DeleteExpenseDialog from "~/components/DeleteExpenseDialog";

interface ExpenseTableProps {
  expenses: ExpenseWithDetails[];
  isLoading?: boolean;
  currentUserId?: string;
  onEdit?: (expense: ExpenseWithDetails) => void;
  onDelete?: (expenseId: string) => void;
}

export default function ExpenseTable({
  expenses,
  isLoading = false,
  currentUserId,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<{ id: string; amount: number } | null>(null);
  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No expenses found for this period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="space-y-4 sm:hidden">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span
                    className="font-medium"
                    style={{
                      color: getCategoryColor(expense.category?.name || ""),
                    }}
                  >
                    {expense.category?.name}
                  </span>
                </div>
                <span className="font-bold">{formatCurrency(expense.amount)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p>{formatDate(expense.date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Location</p>
                  <p>{expense.location?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Paid By</p>
                  <p>
                    {expense.paidByUserId === currentUserId
                      ? "You"
                      : expense.paidByUser?.username || expense.paidByUser?.email?.split('@')[0]}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Split</p>
                  <p>{expense.splitType || "50/50"}</p>
                </div>
                {expense.description && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Description</p>
                    <p>{expense.description}</p>
                  </div>
                )}
              </div>
              {(onEdit || onDelete) && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(expense)}
                      className="h-8 px-2"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setExpenseToDelete({ id: expense.id, amount: expense.amount });
                        setIsDeleteDialogOpen(true);
                      }}
                      className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead>Split</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {(onEdit || onDelete) && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span
                        style={{
                          color: getCategoryColor(expense.category?.name || ""),
                        }}
                      >
                        {expense.category?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{expense.location?.name}</TableCell>
                  <TableCell>
                    {expense.paidByUserId === currentUserId
                      ? "You"
                      : expense.paidByUser?.username || expense.paidByUser?.email?.split('@')[0]}
                  </TableCell>
                  <TableCell>{expense.splitType || "50/50"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {expense.description || "-"}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(expense)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setExpenseToDelete({ id: expense.id, amount: expense.amount });
                              setIsDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      {onDelete && expenseToDelete && (
        <DeleteExpenseDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          expenseAmount={expenseToDelete.amount}
          onConfirm={() => {
            if (expenseToDelete && onDelete) {
              onDelete(expenseToDelete.id);
              setIsDeleteDialogOpen(false);
              setExpenseToDelete(null);
            }
          }}
        />
      )}
    </Card>
  );
}
