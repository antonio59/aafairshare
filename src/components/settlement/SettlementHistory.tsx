
import { Card, CardContent } from "@/components/ui/card";

const SettlementHistory = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Settlement History</h2>
        
        <div className="flex items-center justify-center py-12 text-gray-500">
          No settlements recorded yet.
        </div>
      </CardContent>
    </Card>
  );
};

export default SettlementHistory;
