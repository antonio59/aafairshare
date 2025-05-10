
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { MonthData, User } from "@/types";
import { getUsers } from "@/services/expenseService";

interface SettlementCardProps {
  monthData: MonthData | undefined;
  isSettling: boolean;
  isUnsettling: boolean;
  settlementExists: boolean;
  onSettlement: () => Promise<void>;
  onUnsettlement: () => Promise<void>;
}

const SettlementCard = ({
  monthData,
  isSettling,
  isUnsettling,
  settlementExists,
  onSettlement,
  onUnsettlement
}: SettlementCardProps) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    
    fetchUsers();
  }, []);

  const user1 = users[0] || { name: "User 1", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1" };
  const user2 = users[1] || { name: "User 2", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2" };

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
                    src={monthData.settlementDirection === "owes" ? user1.avatar : user2.avatar}
                    alt="From avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-base">owes</span>
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={monthData.settlementDirection === "owes" ? user2.avatar : user1.avatar}
                    alt="To avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-4xl font-bold">
                £{Math.ceil(monthData.settlement).toFixed(2)}
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

        {settlementExists ? (
          <Button
            className="w-full py-6"
            variant="destructive"
            size="lg"
            disabled={isUnsettling}
            onClick={onUnsettlement}
          >
            <X className="mr-2 h-5 w-5" />
            {isUnsettling ? "Processing..." : "Mark as Unsettled"}
          </Button>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default SettlementCard;
