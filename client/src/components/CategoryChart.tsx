import { useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { MonthSummary } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Chart, registerables } from 'chart.js';
import { cn } from "@/lib/utils";

Chart.register(...registerables);

interface CategoryChartProps {
  summary: MonthSummary | undefined;
  isLoading?: boolean;
}

export default function CategoryChart({ summary, isLoading = false }: CategoryChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (isLoading || !summary || summary.categoryTotals.length === 0) return;

    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const categories = summary.categoryTotals.map(ct => ct.category.name);
    const amounts = summary.categoryTotals.map(ct => Number(ct.amount));
    const colors = summary.categoryTotals.map(ct => ct.category.color);

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: colors,
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw as number;
                const total = context.dataset.data.reduce((acc: number, cur: number) => acc + cur, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [summary, isLoading]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || summary.categoryTotals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-gray-600">No expense data available for this month.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle>Category Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <canvas ref={chartRef} />
          </div>
          <div>
            <div className="space-y-4">
              {summary.categoryTotals.map((categoryTotal, index) => (
                <div key={categoryTotal.category.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={cn("h-3 w-3 rounded-full")}
                      style={{ backgroundColor: categoryTotal.category.color }}
                    ></div>
                    <span className="ml-2 text-sm text-gray-600">{categoryTotal.category.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      {formatCurrency(Number(categoryTotal.amount))}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      {categoryTotal.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
