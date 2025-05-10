
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { MonthData } from "@/types";

interface SettlementCardProps {
  monthData: MonthData | undefined;
  isSettling: boolean;
  onSettlement: () => Promise<void>;
}

const SettlementCard = ({
  monthData,
  isSettling,
  onSettlement,
}: SettlementCardProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-8">
          Current Month Settlement
        </h2>

        {monthData && monthData.settlement > 0 ? (
          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                      monthData.settlementDirection === "owes" ? "Antonio" : "Andres"
                    }`}
                    alt="From avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-base">owes</span>
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                      monthData.settlementDirection === "owes" ? "Andres" : "Antonio"
                    }`}
                    alt="To avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-4xl font-bold">
                £{monthData.settlement.toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <div className="text-2xl font-medium mb-2">
                No Settlement Needed
              </div>
              <div className="text-gray-500">
                Expenses are already balanced for this month.
              </div>
            </div>
          </div>
        )}

        <Button
          className="w-full py-6"
          variant="default"
          size="lg"
          disabled={!monthData || monthData.settlement === 0 || isSettling}
          onClick={onSettlement}
        >
          <Check className="mr-2 h-5 w-5" />
          {isSettling ? "Processing..." : "Mark as Settled"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SettlementCard;
