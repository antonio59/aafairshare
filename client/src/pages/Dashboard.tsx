import React, { useState, useEffect } from "react";
import MonthSelector from "@/components/MonthSelector";
import SummaryCard from "@/components/SummaryCard";
import ExpenseTable from "@/components/ExpenseTable";
import CategoryChart from "@/components/CategoryChart";
import ExpenseForm from "@/components/ExpenseForm";
import { Button } from "@/components/ui/button";
import { PlusIcon, PoundSterling, Users, WalletCards, BarChart3 } from "lucide-react";
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

  // Find users from expenses or summary
  const userIds = summary?.userExpenses ? Object.keys(summary.userExpenses).map(Number) : [];
  const user1 = userIds.length > 0 ? userIds[0].toString() : "1";
  const user2 = userIds.length > 1 ? userIds[1].toString() : "2";

  // Get all unique users from expenses
  const uniqueUsers = expenses
    ? [...new Set(expenses.map(e => e.paidByUser.id))]
        .map(id => expenses.find(e => e.paidByUser.id === id)?.paidByUser)
        .filter(Boolean)
    : [];

  // Get user names from the uniqueUsers array
  const user1Obj = uniqueUsers.find(u => u?.id.toString() === user1);
  const user2Obj = uniqueUsers.find(u => u?.id.toString() === user2);
  
  const user1Name = user1Obj?.username || "User 1";
  const user2Name = user2Obj?.username || "User 2";

  return (
    <div className="space-y-6 px-2 sm:px-4 pb-20">
      <div className="mb-4">
        <MonthSelector onMonthChange={handleMonthChange} onExport={handleExport} />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              icon={PoundSterling} 
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium text-gray-800">Recent Expenses</h3>
            <Link href="/expenses" className="text-xs sm:text-sm font-medium text-primary hover:text-blue-700">
              View all
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <ExpenseTable 
            expenses={expenses?.slice(0, 5) || []} 
            onEdit={handleEditExpense} 
            isLoading={expensesLoading} 
          />
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <CategoryChart summary={summary} isLoading={summaryLoading} />
      </div>

      {/* Add New Expense Button */}
      <Button 
        onClick={handleAddExpense}
        className="fixed bottom-16 right-4 sm:bottom-8 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors p-0 z-10"
      >
        <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6" />
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
