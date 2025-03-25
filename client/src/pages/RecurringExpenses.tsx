import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecurringExpenseTable from "@/components/RecurringExpenseTable";
import RecurringExpenseForm from "@/components/RecurringExpenseForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import type { RecurringExpenseWithDetails } from "@shared/schema";

export default function RecurringExpenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecurringExpense, setSelectedRecurringExpense] = useState<RecurringExpenseWithDetails | undefined>(undefined);
  const [processingExpenses, setProcessingExpenses] = useState(false);

  // Fetch recurring expenses
  const { data: recurringExpenses = [], isLoading } = useQuery<RecurringExpenseWithDetails[]>({
    queryKey: ["/api/recurring-expenses"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Handle editing a recurring expense
  const handleEditRecurringExpense = (recurringExpense: RecurringExpenseWithDetails) => {
    setSelectedRecurringExpense(recurringExpense);
    setFormOpen(true);
  };

  // Reset form and selected recurring expense when form closes
  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setSelectedRecurringExpense(undefined);
    }
  };

  // Handle recurring expense deletion
  const handleRecurringExpenseDeleted = () => {
    queryClient.invalidateQueries({
      queryKey: ["/api/recurring-expenses"],
    });
    toast({
      title: "Recurring expense deleted",
      description: "The recurring expense has been removed",
    });
  };

  // Process recurring expenses
  const handleProcessRecurringExpenses = async () => {
    setProcessingExpenses(true);
    try {
      const response = await apiRequest("POST", "/api/process-recurring-expenses");
      const result = await response.json();

      // Invalidate both recurring expenses and expenses queries
      queryClient.invalidateQueries({
        queryKey: ["/api/recurring-expenses"],
      });

      queryClient.invalidateQueries({
        queryKey: ["/api/expenses"],
      });

      // Show success message
      toast({
        title: "Recurring expenses processed",
        description: `${result.expenses.length} new expense(s) created`,
      });
    } catch (error) {
      console.error("Error processing recurring expenses:", error);
      toast({
        title: "Error",
        description: "Failed to process recurring expenses",
        variant: "destructive",
      });
    } finally {
      setProcessingExpenses(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Expenses</h1>
          <p className="text-muted-foreground">
            Manage your recurring expenses that generate automatically
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleProcessRecurringExpenses}
            variant="outline"
            disabled={processingExpenses}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {processingExpenses ? "Processing..." : "Process Now"}
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Recurring Expense
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recurring Expenses</CardTitle>
          <CardDescription>
            View and manage your recurring expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecurringExpenseTable
            recurringExpenses={recurringExpenses}
            onEdit={handleEditRecurringExpense}
            onDeleted={handleRecurringExpenseDeleted}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <RecurringExpenseForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        recurringExpense={selectedRecurringExpense}
      />
    </div>
  );
}