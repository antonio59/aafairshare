
import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check 
} from "lucide-react";
import { 
  getMonthData, 
  getCurrentYear, 
  getCurrentMonth,
  markSettlementComplete
} from "@/services/expenseService";

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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-28 text-center">
              {currentMonthLabel}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
          {/* Current Month Settlement */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-8">Current Month Settlement</h2>
              
              {monthData && monthData.settlement > 0 ? (
                <div className="flex justify-center mb-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${monthData.settlementDirection === 'owes' ? 'Antonio' : 'Andres'}`}
                          alt="From avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-base">owes</span>
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${monthData.settlementDirection === 'owes' ? 'Andres' : 'Antonio'}`}
                          alt="To avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="text-4xl font-bold">£{monthData.settlement.toFixed(2)}</div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-medium mb-2">No Settlement Needed</div>
                    <div className="text-gray-500">Expenses are already balanced for this month.</div>
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full py-6" 
                variant="default" 
                size="lg"
                disabled={!monthData || monthData.settlement === 0 || isSettling}
                onClick={handleSettlement}
              >
                <Check className="mr-2 h-5 w-5" />
                {isSettling ? "Processing..." : "Mark as Settled"}
              </Button>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio"
                      alt="Antonio avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-lg font-medium">Antonio Paid</span>
                </div>
                <div className="text-3xl font-bold">£{monthData?.user1Paid.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andres"
                      alt="Andres avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-lg font-medium">Andres Paid</span>
                </div>
                <div className="text-3xl font-bold">£{monthData?.user2Paid.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Settlement History */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Settlement History</h2>
              
              <div className="flex items-center justify-center py-12 text-gray-500">
                No settlements recorded yet.
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Settlement;
