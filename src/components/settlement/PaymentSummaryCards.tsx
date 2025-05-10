
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getUsers } from "@/services/expenseService";
import { User } from "@/types";

interface PaymentSummaryCardsProps {
  user1Paid: number;
  user2Paid: number;
}

const PaymentSummaryCards = ({ user1Paid, user2Paid }: PaymentSummaryCardsProps) => {
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

  // Get first two users or create placeholders if not loaded yet
  const user1 = users[0] || { name: "User 1", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1" };
  const user2 = users[1] || { name: "User 2", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2" };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={user1.avatar}
                alt={`${user1.name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-medium">{user1.name} Paid</span>
          </div>
          <div className="text-3xl font-bold">£{user1Paid.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={user2.avatar}
                alt={`${user2.name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-medium">{user2.name} Paid</span>
          </div>
          <div className="text-3xl font-bold">£{user2Paid.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSummaryCards;
