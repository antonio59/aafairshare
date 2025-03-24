import { useState } from "react";
import MonthSelector from "@/components/MonthSelector";
import ExpenseTable from "@/components/ExpenseTable";
import ExpenseForm from "@/components/ExpenseForm";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ExpenseWithDetails } from "@shared/schema";
import { getCurrentMonth } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { exportExpenses } from "@/lib/exportUtils";

export default function Expenses() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithDetails | undefined>(undefined);
  const { toast } = useToast();

  // Fetch expenses for the month
  const { 
    data: expenses, 
    isLoading: expensesLoading,
    isError: expensesError
  } = useQuery<ExpenseWithDetails[]>({
    queryKey: [`/api/expenses?month=${currentMonth}`],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load expenses data. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  const handleAddExpense = () => {
    setSelectedExpense(undefined);
    setIsExpenseFormOpen(true);
  };

  const handleEditExpense = (expense: ExpenseWithDetails) => {
    setSelectedExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (expenses && expenses.length > 0) {
      exportExpenses({
        format,
        month: currentMonth,
        expenses
      });
    } else {
      toast({
        title: "Export failed",
        description: "No expenses to export for the selected month.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
      </div>
      
      <MonthSelector onMonthChange={handleMonthChange} onExport={handleExport} />
      
      <ExpenseTable 
        expenses={expenses || []} 
        onEdit={handleEditExpense} 
        isLoading={expensesLoading} 
      />

      {/* Add New Expense Button */}
      <Button 
        onClick={handleAddExpense}
        className="fixed bottom-20 right-6 md:bottom-8 h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors p-0"
      >
        <PlusIcon className="h-6 w-6" />
      </Button>

      {/* Expense Form */}
      <ExpenseForm 
        open={isExpenseFormOpen} 
        onOpenChange={setIsExpenseFormOpen} 
        expense={selectedExpense} 
      />
    </div>
  );
}
