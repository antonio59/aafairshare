
import { Card, CardContent } from "@/components/ui/card";

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
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio"
                alt="Antonio avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-gray-500">Antonio Paid</span>
          </div>
          <span className="text-2xl font-bold">£{user1Paid.toFixed(2)}</span>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andres"
                alt="Andres avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-gray-500">Andres Paid</span>
          </div>
          <span className="text-2xl font-bold">£{user2Paid.toFixed(2)}</span>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andres"
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
