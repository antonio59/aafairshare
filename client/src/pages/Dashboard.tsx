import React, { useState, useEffect } from "react";
import MonthSelector from "@/components/MonthSelector";
import SummaryCard from "@/components/SummaryCard";
import ExpenseTable from "@/components/ExpenseTable";
import ExpenseForm from "@/components/ExpenseForm";
import { Button } from "@/components/ui/button";
import { PlusIcon, PoundSterling, Users, WalletCards } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ExpenseWithDetails, MonthSummary } from "@shared/schema";
import { formatCurrency, getCurrentMonth } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { exportExpenses } from "@/lib/exportUtils";
import { apiRequest } from "@/lib/queryClient";

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

  // Fetch all users
  const {
    data: allUsers = [],
    isLoading: usersLoading
  } = useQuery({
    queryKey: ['/api/users'],
    staleTime: 1000 * 60 * 30, // 30 minutes
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

  // Find users from summary
  const userIds = summary?.userExpenses ? Object.keys(summary.userExpenses).map(Number) : [];
  const user1Id = userIds.length > 0 ? userIds[0] : 0;
  const user2Id = userIds.length > 1 ? userIds[1] : 0;

  // Find user objects from the users array (safely handling unknown data type)
  const user1Obj = Array.isArray(allUsers) ? 
    allUsers.find((u: any) => u.id === user1Id) : null;
  const user2Obj = Array.isArray(allUsers) ? 
    allUsers.find((u: any) => u.id === user2Id) : null;
  
  // Use the username from the user object, or a fallback if not found
  const user1Name = user1Obj?.username || "User 1";
  const user2Name = user2Obj?.username || "User 2";

  // Convert IDs to strings for use in JSX
  const user1IdStr = user1Id.toString();
  const user2IdStr = user2Id.toString();

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
              value={summary && summary.userExpenses[user1Id] ? formatCurrency(summary.userExpenses[user1Id]) : "£0.00"} 
              icon={Users} 
              variant="user1" 
            />
            <SummaryCard 
              title={`${user2Name} Paid`} 
              value={summary && summary.userExpenses[user2Id] ? formatCurrency(summary.userExpenses[user2Id]) : "£0.00"} 
              icon={Users} 
              variant="user2" 
            />
            <SummaryCard 
              title={summary && summary.settlementDirection.fromUserId === user1Id 
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

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium text-gray-800">Expenses</h3>
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

      {/* Category Distribution removed as it's already in Analytics page */}

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
