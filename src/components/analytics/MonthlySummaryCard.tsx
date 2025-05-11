
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlySummaryCardProps {
  totalExpenses: number;
  fairShare: number;
  settlement: number;
  settlementDirection: 'owes' | 'owed' | 'even';
}

const MonthlySummaryCard = ({ 
  totalExpenses, 
  fairShare, 
  settlement, 
  settlementDirection 
}: MonthlySummaryCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Monthly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Total Expenses</div>
            <div className="text-3xl font-bold mt-1">£{totalExpenses ? totalExpenses.toFixed(2) : '0.00'}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Fair Share (50/50)</div>
            <div className="text-3xl font-bold mt-1 text-orange">£{fairShare ? fairShare.toFixed(2) : '0.00'}</div>
          </div>
          {settlementDirection === 'even' ? (
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500">Settlement</div>
              <div className="text-3xl font-bold mt-1 text-green">Even Split</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500">
                Settlement ({settlementDirection === 'owes' ? 'User 1 → User 2' : 'User 2 → User 1'})
              </div>
              <div className="text-3xl font-bold mt-1 text-green">£{settlement ? settlement.toFixed(2) : '0.00'}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySummaryCard;
