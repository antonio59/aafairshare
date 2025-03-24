import { useState } from "react";
import MonthSelector from "@/components/MonthSelector";
import SummaryCard from "@/components/SummaryCard";
import SettlementHistory from "@/components/SettlementHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MonthSummary, Settlement as SettlementType, SettlementWithUsers } from "@shared/schema";
import { getCurrentMonth, formatCurrency } from "@/lib/utils";
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

  // Fetch summary data for the month
  const { 
    data: summary, 
    isLoading: summaryLoading,
    isError: summaryError
  } = useQuery<MonthSummary>({
    queryKey: [`/api/summary/${currentMonth}`],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load summary data. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Fetch settlements for the month
  const {
    data: settlements,
    isLoading: settlementsLoading,
    isError: settlementsError
  } = useQuery<SettlementWithUsers[]>({
    queryKey: [`/api/settlements?month=${currentMonth}`],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load settlements data. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  const handleSettlement = async () => {
    if (!summary) return;

    try {
      const settlementData = {
        month: currentMonth,
        amount: summary.settlementAmount,
        settled_at: new Date().toISOString(),
        from_user_id: summary.settlementDirection.fromUserId,
        to_user_id: summary.settlementDirection.toUserId
      };

      await apiRequest('POST', '/api/settlements', settlementData);

      toast({
        title: "Settlement recorded",
        description: "The settlement has been recorded successfully."
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/settlements?month=${currentMonth}`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record settlement. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  // Find users
  const fromUserName = summary?.settlementDirection.fromUserId ? `User ${summary.settlementDirection.fromUserId}` : "User A";
  const toUserName = summary?.settlementDirection.toUserId ? `User ${summary.settlementDirection.toUserId}` : "User B";

  // Check if a settlement exists for this month
  const isSettled = settlements && settlements.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settlement</h1>
      </div>
      
      <MonthSelector onMonthChange={handleMonthChange} />
      
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
            Object.entries(summary?.userExpenses || {}).map(([userId, amount]) => (
              <div key={userId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className={`p-2 rounded-md ${userId === "1" ? "bg-emerald-100 text-secondary" : "bg-purple-100 text-accent"}`}>
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      {userId === "1" ? "User 1" : "User 2"} Paid
                    </p>
                    <p className="text-xl font-semibold text-gray-800">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))
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
