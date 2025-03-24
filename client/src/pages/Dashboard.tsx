import React, { useState } from "react";
import MonthSelector from "@/components/MonthSelector";
import SummaryCard from "@/components/SummaryCard";
import ExpenseTable from "@/components/ExpenseTable";
import CategoryChart from "@/components/CategoryChart";
import ExpenseForm from "@/components/ExpenseForm";
import { Button } from "@/components/ui/button";
import { PlusIcon, DollarSign, Users, WalletCards, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ExpenseWithDetails, MonthSummary } from "@shared/schema";
import { formatCurrency, getCurrentMonth } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { exportExpenses } from "@/lib/exportUtils";
import * as LucideIcons from "lucide-react";

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithDetails | undefined>(undefined);
  const { toast } = useToast();

  // Fetch summary data for the month
  const { 
    data: summary, 
    isLoading: summaryLoading,
    isError: summaryError
  } = useQuery<MonthSummary>({
    queryKey: [`/api/summary/${currentMonth}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  // If there's an error with summary, show toast
  useEffect(() => {
    if (summaryError) {
      toast({
        title: "Error",
        description: "Failed to load summary data. Please try again.",
        variant: "destructive"
      });
    }
  }, [summaryError, toast]);

  // Fetch expenses for the month
  const { 
    data: expenses = [], // provide empty array as default
    isLoading: expensesLoading,
    isError: expensesError
  } = useQuery<ExpenseWithDetails[]>({
    queryKey: [`/api/expenses?month=${currentMonth}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
  
  // If there's an error with expenses, show toast
  useEffect(() => {
    if (expensesError) {
      toast({
        title: "Error",
        description: "Failed to load expenses data. Please try again.",
        variant: "destructive"
      });
    }
  }, [expensesError, toast]);

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

  // Find users
  const user1 = summary?.userExpenses && Object.keys(summary.userExpenses).length > 0 
    ? Object.keys(summary.userExpenses)[0] 
    : "1";
  const user2 = summary?.userExpenses && Object.keys(summary.userExpenses).length > 1 
    ? Object.keys(summary.userExpenses)[1] 
    : "2";

  // Get the user1 and user2 names
  const user1Name = expenses && expenses.length > 0 && expenses[0].paidByUser.id.toString() === user1
    ? expenses[0].paidByUser.username
    : "User 1";
  const user2Name = expenses && expenses.length > 0 && expenses.find(e => e.paidByUser.id.toString() === user2)?.paidByUser.username
    ? expenses.find(e => e.paidByUser.id.toString() === user2)?.paidByUser.username
    : "User 2";

  return (
    <div className="space-y-6">
      <MonthSelector onMonthChange={handleMonthChange} onExport={handleExport} />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <SummaryCard 
              title="Total Expenses" 
              value={summary ? formatCurrency(summary.totalExpenses) : "£0.00"} 
              icon={DollarSign} 
              variant="total" 
            />
            <SummaryCard 
              title={`${user1Name} Paid`} 
              value={summary && summary.userExpenses[Number(user1)] ? formatCurrency(summary.userExpenses[Number(user1)]) : "£0.00"} 
              icon={Users} 
              variant="user1" 
            />
            <SummaryCard 
              title={`${user2Name} Paid`} 
              value={summary && summary.userExpenses[Number(user2)] ? formatCurrency(summary.userExpenses[Number(user2)]) : "£0.00"} 
              icon={Users} 
              variant="user2" 
            />
            <SummaryCard 
              title={summary && summary.settlementDirection.fromUserId === Number(user1) 
                ? `${user1Name} Owes ${user2Name}` 
                : `${user2Name} Owes ${user1Name}`} 
              value={summary ? formatCurrency(summary.settlementAmount) : "£0.00"} 
              icon={WalletCards} 
              variant="balance" 
              isNegative={true}
            />
          </>
        )}
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">Recent Expenses</h3>
            <Link href="/expenses" className="text-sm font-medium text-primary hover:text-blue-700">
              View all
            </Link>
          </div>
        </div>
        <ExpenseTable 
          expenses={expenses?.slice(0, 5) || []} 
          onEdit={handleEditExpense} 
          isLoading={expensesLoading} 
        />
      </div>

      {/* Category Distribution */}
      <CategoryChart summary={summary} isLoading={summaryLoading} />

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
