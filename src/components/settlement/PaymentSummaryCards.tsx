
import { Card, CardContent } from "@/components/ui/card";

interface PaymentSummaryCardsProps {
  user1Paid: number;
  user2Paid: number;
}

const PaymentSummaryCards = ({ user1Paid, user2Paid }: PaymentSummaryCardsProps) => {
  return (
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
          <div className="text-3xl font-bold">£{user1Paid.toFixed(2)}</div>
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
          <div className="text-3xl font-bold">£{user2Paid.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSummaryCards;
