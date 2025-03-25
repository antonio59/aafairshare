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
    <div className="space-y-6 px-2 sm:px-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        
        {/* Add New Expense Button for larger screens */}
        <Button 
          onClick={handleAddExpense}
          className="hidden sm:flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>
      
      <MonthSelector onMonthChange={handleMonthChange} onExport={handleExport} />
      
      {/* Expenses Table with Add Button for Mobile */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="px-3 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium text-gray-800">Expenses</h3>
            
            {/* Add New Expense Button for small screens - inside the table header */}
            <Button 
              onClick={handleAddExpense}
              size="sm"
              variant="outline"
              className="sm:hidden"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <ExpenseTable 
            expenses={expenses || []} 
            onEdit={handleEditExpense} 
            isLoading={expensesLoading} 
          />
        </div>
      </div>

      {/* Floating Add New Expense Button for mid-size screens */}
      <Button 
        onClick={handleAddExpense}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-6 h-12 w-12 rounded-full bg-primary text-white shadow-lg flex sm:hidden md:flex items-center justify-center hover:bg-blue-600 transition-colors p-0 z-10"
      >
        <PlusIcon className="h-5 w-5" />
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
