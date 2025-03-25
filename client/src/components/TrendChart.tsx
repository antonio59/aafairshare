import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendData } from "@shared/schema";
import { Line } from "react-chartjs-2";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMonthYear } from "@/lib/utils";
import { stringToColor } from "@/lib/utils";

interface TrendChartProps {
  trendData?: TrendData;
  isLoading?: boolean;
}

export default function TrendChart({ trendData, isLoading = false }: TrendChartProps) {
  const [activeTrendType, setActiveTrendType] = useState<"categories" | "locations">("categories");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!trendData || trendData.months.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Not enough data to show trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format month labels (e.g., 2025-03 → Mar 2025)
  const formattedMonths = trendData.months.map(month => formatMonthYear(month));

  // Create the dataset for total expenses
  const totalExpensesDataset = {
    label: "Total Expenses",
    data: trendData.totalsByMonth,
    borderColor: "#7c3aed",
    backgroundColor: "rgba(124, 58, 237, 0.1)",
    borderWidth: 2,
    tension: 0.4,
    fill: false
  };

  // Generate datasets for categories
  const categoryDatasets = Object.entries(trendData.categoriesData)
    .filter(([_, values]) => values.some(value => value > 0)) // Only include categories with data
    .map(([category, values]) => {
      const color = stringToColor(category);
      return {
        label: category,
        data: values,
        borderColor: color,
        backgroundColor: `${color}33`, // Add 20% opacity
        borderWidth: 2,
        tension: 0.4,
        fill: false
      };
    });

  // Generate datasets for locations
  const locationDatasets = Object.entries(trendData.locationsData)
    .filter(([_, values]) => values.some(value => value > 0)) // Only include locations with data
    .map(([location, values]) => {
      const color = stringToColor(location);
      return {
        label: location,
        data: values,
        borderColor: color,
        backgroundColor: `${color}33`, // Add 20% opacity
        borderWidth: 2,
        tension: 0.4,
        fill: false
      };
    });

  const totalData = {
    labels: formattedMonths,
    datasets: [totalExpensesDataset]
  };

  const categoriesData = {
    labels: formattedMonths,
    datasets: categoryDatasets
  };

  const locationsData = {
    labels: formattedMonths,
    datasets: locationDatasets
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Format the y-axis values as currency
          callback: function(tickValue: any) {
            if (typeof tickValue === 'number') {
              return `£${tickValue.toFixed(0)}`;
            }
            return tickValue;
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: £${value.toFixed(2)}`;
          }
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="total" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="total">Total Expenses</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="locations">By Location</TabsTrigger>
          </TabsList>
          <TabsContent value="total" className="pt-4">
            <div className="h-[300px]">
              <Line data={totalData} options={options} />
            </div>
          </TabsContent>
          <TabsContent value="categories" className="pt-4">
            <div className="h-[300px]">
              <Line data={categoriesData} options={options} />
            </div>
          </TabsContent>
          <TabsContent value="locations" className="pt-4">
            <div className="h-[300px]">
              <Line data={locationsData} options={options} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}