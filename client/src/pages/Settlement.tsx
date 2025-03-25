import { useState, useEffect } from "react";
import MonthSelector from "@/components/MonthSelector";
import SummaryCard from "@/components/SummaryCard";
import SettlementHistory from "@/components/SettlementHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Check, CalendarClock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MonthSummary, Settlement as SettlementType, SettlementWithUsers, User, ExpenseWithDetails } from "@shared/schema";
import { getCurrentMonth, formatCurrency, getPreviousMonth } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
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

export default function Settlement() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch users
  const {
    data: users = [],
    isLoading: usersLoading
  } = useQuery<User[]>({
    queryKey: ['/api/users']
  });

  // Fetch summary data for the month
  const { 
    data: summary, 
    isLoading: summaryLoading,
    isError: summaryError
  } = useQuery<MonthSummary>({
    queryKey: [`/api/summary/${currentMonth}`]
  });

  // Show error toast if summary query fails
  useEffect(() => {
    if (summaryError) {
      toast({
        title: "Error",
        description: "Failed to load summary data. Please try again.",
        variant: "destructive"
      });
    }
  }, [summaryError, toast]);

  // Fetch settlements for the month
  const {
    data: settlements,
    isLoading: settlementsLoading,
    isError: settlementsError
  } = useQuery<SettlementWithUsers[]>({
    queryKey: [`/api/settlements?month=${currentMonth}`]
  });
  
  // Show error toast if settlements query fails
  useEffect(() => {
    if (settlementsError) {
      toast({
        title: "Error",
        description: "Failed to load settlements data. Please try again.",
        variant: "destructive"
      });
    }
  }, [settlementsError, toast]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  const handleSettlement = async () => {
    if (!summary) return;

    try {
      const settlementData = {
        month: currentMonth, // YYYY-MM format
        amount: summary.settlementAmount.toString(),
        date: new Date().toISOString(),
        from_user_id: summary.settlementDirection.fromUserId,
        to_user_id: summary.settlementDirection.toUserId,
        notes: `Settlement for ${currentMonth}`,
      };
      
      console.log('Settlement data:', settlementData);
      
      const response = await apiRequest('/api/settlements', 'POST', settlementData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Settlement error:', errorData);
        throw new Error(errorData.message || 'Failed to record settlement');
      }

      toast({
        title: "Settlement recorded",
        description: "The settlement has been recorded successfully."
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/settlements?month=${currentMonth}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/summary/${currentMonth}`] });
    } catch (error) {
      console.error('Settlement error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record settlement. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  // Get data for the previous month to help calculate unsettled months
  const previousMonth = getPreviousMonth(currentMonth);
  const {
    data: previousMonthSettlements = []
  } = useQuery<SettlementWithUsers[]>({
    queryKey: [`/api/settlements?month=${previousMonth}`],
    enabled: !!currentMonth
  });

  // Find user names based on IDs
  const getUserName = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : `User ${userId}`;
  };

  const fromUserName = summary?.settlementDirection.fromUserId 
    ? getUserName(summary.settlementDirection.fromUserId) 
    : "User A";
    
  const toUserName = summary?.settlementDirection.toUserId 
    ? getUserName(summary.settlementDirection.toUserId) 
    : "User B";

  // Check if a settlement exists for this month
  const isSettled = settlements && settlements.length > 0;
  
  // Get previous month's expenses
  const {
    data: previousMonthExpenses = []
  } = useQuery<ExpenseWithDetails[]>({
    queryKey: [`/api/expenses?month=${previousMonth}`],
    enabled: !!previousMonth
  });
  
  // Calculate unsettled months - only show warning if there are actual expenses
  const previousMonthIsSettled = previousMonthSettlements && previousMonthSettlements.length > 0;
  const hasPreviousMonthExpenses = previousMonthExpenses && previousMonthExpenses.length > 0;
  const unsettledMonths = (!previousMonthIsSettled && hasPreviousMonthExpenses) ? 1 : 0;

  return (
    <div className="space-y-6 px-2 sm:px-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Settlement</h1>
      </div>
      
      <MonthSelector onMonthChange={handleMonthChange} />
      
      {/* Unsettled months card */}
      {unsettledMonths > 0 && (
        <Card className="bg-amber-50 border-amber-200 mt-4">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start sm:items-center">
                <div className="p-2 rounded-full bg-amber-100 flex-shrink-0">
                  <CalendarClock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Unsettled Month
                  </h3>
                  <p className="text-sm text-amber-600 mt-1">
                    The previous month hasn't been settled yet
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-200 text-amber-700 hover:bg-amber-100 w-full sm:w-auto"
                onClick={() => handleMonthChange(previousMonth)}
              >
                View Previous Month
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current settlement card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Month Settlement</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500">
                    {fromUserName} owes {toUserName}
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {summary ? formatCurrency(summary.settlementAmount) : "£0.00"}
                  </p>
                </div>
                
                {!isSettled && summary && summary.settlementAmount > 0 && (
                  <Button 
                    className="w-full"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Settled
                  </Button>
                )}
                
                {isSettled && (
                  <div className="bg-green-50 text-green-600 p-3 rounded-md text-center text-sm font-medium">
                    This month has been settled!
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* User summaries */}
        <div className="space-y-4">
          {summaryLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : (
            Object.entries(summary?.userExpenses || {}).map(([userIdStr, amount]) => {
              const userId = parseInt(userIdStr, 10);
              const username = getUserName(userId);
              const isFirstUser = userId === (users[0]?.id || 0);
              
              return (
                <div key={userId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${isFirstUser ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-purple-600"}`}>
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        {username} Paid
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Settlement history */}
      <SettlementHistory 
        settlements={settlements || []} 
        isLoading={settlementsLoading} 
      />
      
      {/* Confirm settlement dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Settlement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this settlement as complete?
              {summary && (
                <div className="mt-2 font-medium">
                  {fromUserName} will pay {toUserName} {formatCurrency(summary.settlementAmount)}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSettlement}>
              Confirm Settlement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
