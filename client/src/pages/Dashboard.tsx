import React, { useState, useEffect } from "react";
import MonthSelector from "@/components/MonthSelector";
import SummaryCard from "@/components/SummaryCard";
import ExpenseTable from "@/components/ExpenseTable";
import ExpenseForm from "@/components/ExpenseForm";
import { Button } from "@/components/ui/button";
import { PlusIcon, PoundSterling, Users, WalletCards } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ExpenseWithDetails, MonthSummary, SettlementWithUsers } from "@shared/schema";
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

  // Fetch settlements for the month
  const { 
    data: settlements = [] as SettlementWithUsers[], 
    isLoading: settlementsLoading 
  } = useQuery<SettlementWithUsers[]>({
    queryKey: [`/api/settlements?month=${currentMonth}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (expenses && expenses.length > 0) {
      exportExpenses({
        format,
        month: currentMonth,
        expenses,
        settlements, // Add settlements data
        summary      // Add summary data
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
    <div className="space-y-4 md:space-y-6">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        
        <Button 
          onClick={handleAddExpense}
          className="flex items-center"
          size="sm"
        >
          <PlusIcon className="h-4 w-4 mr-1.5" />
          Add Expense
        </Button>
      </div>
      
      {/* Month Selector - showing on both mobile and desktop */}
      <div className="mb-4">
        <MonthSelector onMonthChange={handleMonthChange} onExport={handleExport} />
      </div>
      
      {/* Mobile Summary Card - Horizontal scrollable */}
      <div className="md:hidden bg-card dark:bg-card border border-border dark:border-border rounded-xl p-3 mb-4">
        {summaryLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            <Skeleton className="h-16 w-44 flex-shrink-0" />
            <Skeleton className="h-16 w-44 flex-shrink-0" />
            <Skeleton className="h-16 w-44 flex-shrink-0" />
            <Skeleton className="h-16 w-44 flex-shrink-0" />
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            <div className="min-w-[180px] p-3 bg-background dark:bg-background rounded-lg border border-border dark:border-border">
              <div className="flex items-center justify-between">
                <PoundSterling className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-lg font-bold mt-1">
                {summary ? formatCurrency(summary.totalExpenses) : "£0.00"}
              </p>
            </div>
            
            <div className="min-w-[180px] p-3 bg-background dark:bg-background rounded-lg border border-border dark:border-border">
              <div className="flex items-center justify-between">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground truncate">{user1Name}</span>
              </div>
              <p className="text-lg font-bold mt-1">
                {summary && summary.userExpenses[user1Id] ? formatCurrency(summary.userExpenses[user1Id]) : "£0.00"}
              </p>
            </div>
            
            <div className="min-w-[180px] p-3 bg-background dark:bg-background rounded-lg border border-border dark:border-border">
              <div className="flex items-center justify-between">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground truncate">{user2Name}</span>
              </div>
              <p className="text-lg font-bold mt-1">
                {summary && summary.userExpenses[user2Id] ? formatCurrency(summary.userExpenses[user2Id]) : "£0.00"}
              </p>
            </div>
            
            <div className="min-w-[180px] p-3 bg-background dark:bg-background rounded-lg border border-border dark:border-border">
              <div className="flex items-center justify-between">
                <WalletCards className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground truncate">
                  {summary && summary.settlementDirection.fromUserId === user1Id 
                    ? `${user1Name} Owes ${user2Name}` 
                    : `${user2Name} Owes ${user1Name}`}
                </span>
              </div>
              <p className="text-lg font-bold mt-1 text-red-500">
                {summary ? formatCurrency(summary.settlementAmount) : "£0.00"}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop Summary Cards - Grid layout */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {summaryLoading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
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

      {/* Recent Expenses Section - Mobile & Desktop */}
      <div className="pb-20 md:pb-0">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Recent Expenses</h2>
          
          <Button 
            onClick={handleAddExpense}
            variant="outline"
            size="sm"
            className="h-9 min-w-[80px]"
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add
          </Button>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-foreground">Expenses</h3>
        </div>
        
        {/* Expense List/Table */}
        <ExpenseTable 
          expenses={expenses || []} 
          onEdit={handleEditExpense} 
          isLoading={expensesLoading} 
        />
      </div>

      {/* Expense Form */}
      <ExpenseForm 
        open={isExpenseFormOpen} 
        onOpenChange={setIsExpenseFormOpen} 
        expense={selectedExpense} 
      />
    </div>
  );
}
