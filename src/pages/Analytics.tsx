
import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  BarChart4
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { 
  getAnalyticsData, 
  getCurrentYear, 
  getCurrentMonth 
} from "@/services/expenseService";

// Color palette for charts
const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#f97316", // orange
  "#10b981", // green
  "#8b5cf6", // purple
  "#06b6d4", // cyan
];

const Analytics = () => {
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());

  // Format the month for display
  const currentMonthLabel = format(new Date(year, month - 1, 1), "MMMM yyyy");

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", year, month],
    queryFn: () => getAnalyticsData(year, month),
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
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
      ) : data ? (
        <>
          {/* Monthly Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">Total Expenses</div>
                  <div className="text-3xl font-bold mt-1">£{data.totalExpenses ? data.totalExpenses.toFixed(2) : '0.00'}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">Fair Share (50/50)</div>
                  <div className="text-3xl font-bold mt-1 text-orange">£{data.fairShare ? data.fairShare.toFixed(2) : '0.00'}</div>
                </div>
                {data.settlementDirection === 'even' ? (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500">Settlement</div>
                    <div className="text-3xl font-bold mt-1 text-green">Even Split</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500">
                      Settlement ({data.settlementDirection === 'owes' ? 'User 1 → User 2' : 'User 2 → User 1'})
                    </div>
                    <div className="text-3xl font-bold mt-1 text-green">£{data.settlement ? data.settlement.toFixed(2) : '0.00'}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Expense Comparison */}
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-base">User Expense Comparison</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "User 1", value: data.userComparison?.user1Percentage || 0 },
                          { name: "User 2", value: data.userComparison?.user2Percentage || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell key="cell-1" fill={COLORS[0]} />
                        <Cell key="cell-2" fill={COLORS[5]} />
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expenses by Category */}
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryBreakdown || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="name"
                      >
                        {data.categoryBreakdown?.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => `£${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Expenses by Location */}
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Expenses by Location</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.locationBreakdown || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="name"
                      >
                        {data.locationBreakdown?.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => `£${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex justify-center p-12">
          <div>No data available for this month.</div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
