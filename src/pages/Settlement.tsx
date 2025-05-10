
import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  getMonthData, 
  getCurrentYear, 
  getCurrentMonth,
  markSettlementComplete
} from "@/services/expenseService";

import MonthNavigator from "@/components/settlement/MonthNavigator";
import SettlementCard from "@/components/settlement/SettlementCard";
import PaymentSummaryCards from "@/components/settlement/PaymentSummaryCards";
import SettlementHistory from "@/components/settlement/SettlementHistory";

const Settlement = () => {
  const { toast } = useToast();
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [isSettling, setIsSettling] = useState(false);

  // Format the current month for display
  const currentMonthLabel = format(new Date(year, month - 1, 1), "MMMM yyyy");

  // Fetch the month data
  const { data: monthData, isLoading, error, refetch } = useQuery({
    queryKey: ["monthData", year, month],
    queryFn: () => getMonthData(year, month),
  });

  const navigateMonth = (direction: "prev" | "next") => {
    let newMonth = month;
    let newYear = year;

    if (direction === "prev") {
      newMonth -= 1;
      if (newMonth === 0) {
        newMonth = 12;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth === 13) {
        newMonth = 1;
        newYear += 1;
      }
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  const handleSettlement = async () => {
    if (!monthData) return;

    setIsSettling(true);

    try {
      // Determine who is paying whom
      const fromUserId = monthData.settlementDirection === 'owes' ? "1" : "2"; // User 1 or User 2
      const toUserId = fromUserId === "1" ? "2" : "1";
      
      await markSettlementComplete(year, month, monthData.settlement, fromUserId, toUserId);
      
      toast({
        title: "Settlement Complete",
        description: "The settlement has been marked as complete.",
      });
      
      // Refresh the data
      refetch();
      
    } catch (error) {
      console.error("Error settling expense:", error);
      toast({
        title: "Settlement Failed",
        description: "Failed to mark settlement as complete. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settlement</h1>
        <div className="flex items-center gap-3">
          <MonthNavigator 
            currentMonthLabel={currentMonthLabel} 
            onNavigateMonth={navigateMonth}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div>Loading...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center p-12 text-red-500">
          Error loading data.
        </div>
      ) : (
        <>
          <SettlementCard 
            monthData={monthData} 
            isSettling={isSettling}
            onSettlement={handleSettlement}
          />

          <PaymentSummaryCards 
            user1Paid={monthData?.user1Paid || 0} 
            user2Paid={monthData?.user2Paid || 0} 
          />

          <SettlementHistory />
        </>
      )}
    </div>
  );
};

export default Settlement;
