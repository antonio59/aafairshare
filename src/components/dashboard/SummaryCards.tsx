
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getUsers } from "@/services/expenseService";
import { User } from "@/types";

interface SummaryCardsProps {
  totalExpenses: number;
  user1Paid: number;
  user2Paid: number;
  settlement: number;
}

const SummaryCards = ({ 
  totalExpenses, 
  user1Paid, 
  user2Paid, 
  settlement 
}: SummaryCardsProps) => {
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

  // Determine who owes money based on total paid
  const payer = user1Paid > user2Paid ? user2 : user1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">£</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Total</span>
          </div>
          <span className="text-2xl font-bold">£{totalExpenses.toFixed(2)}</span>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src={user1.avatar}
                alt={`${user1.name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-gray-500">{user1.name} Paid</span>
          </div>
          <span className="text-2xl font-bold">£{user1Paid.toFixed(2)}</span>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src={user2.avatar}
                alt={`${user2.name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-gray-500">{user2.name} Paid</span>
          </div>
          <span className="text-2xl font-bold">£{user2Paid.toFixed(2)}</span>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src={settlement > 0 ? payer.avatar : "https://api.dicebear.com/7.x/avataaars/svg?seed=even"}
                alt="Settlement avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-gray-500">Settlement Due</span>
          </div>
          <span className="text-2xl font-bold text-green">£{settlement.toFixed(2)}</span>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
