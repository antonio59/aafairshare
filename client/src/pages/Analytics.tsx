import { useState, useRef, useCallback, useEffect } from "react";
import MonthSelector from "@/components/MonthSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { MonthSummary, User, TrendData } from "@shared/schema";
import { getCurrentMonth, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryChart from "@/components/CategoryChart";
import LocationChart from "@/components/LocationChart";
import SplitTypeChart from "@/components/SplitTypeChart";
import TrendChart from "@/components/TrendChart";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function Analytics() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch summary data for the month
  const { 
    data: summary, 
    isLoading: summaryLoading,
    isError: summaryError
  } = useQuery<MonthSummary>({
    queryKey: [`/api/summary/${currentMonth}`]
  });
  
  // Fetch users for displaying proper names
  const { 
    data: users = [],
    isLoading: usersLoading
  } = useQuery<User[]>({
    queryKey: ['/api/users']
  });
  
  // Fetch trend data for the charts
  const {
    data: trendData,
    isLoading: trendLoading,
    isError: trendError
  } = useQuery<TrendData>({
    queryKey: ['/api/trends'],
    staleTime: 1000 * 60 * 15 // 15 minutes
  });

  // Show error toast if query fails
  useEffect(() => {
    if (summaryError) {
      toast({
        title: "Error",
        description: "Failed to load summary data. Please try again.",
        variant: "destructive"
      });
    }
    
    if (trendError) {
      toast({
        title: "Error",
        description: "Failed to load trend data. Some charts may not be available.",
        variant: "destructive"
      });
    }
  }, [summaryError, trendError, toast]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // Handle print functionality
  const handlePrint = useCallback(() => {
    if (!printRef.current) return;
    
    try {
      const content = printRef.current;
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Expenses Analytics - ${currentMonth}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .page-break { page-break-before: always; }
              h1 { color: #333; }
              .summary { margin-bottom: 20px; text-align: center; }
              .summary h2 { color: #444; }
              .total { font-size: 24px; font-weight: bold; color: #6366f1; }
            </style>
          </head>
          <body>
            <h1>Expenses Analytics Report - ${currentMonth}</h1>
            <div class="summary">
              <h2>Monthly Summary</h2>
              <p class="total">Total: ${summary ? formatCurrency(summary.totalExpenses) : "£0.00"}</p>
              <p>Settlement: ${summary ? formatCurrency(summary.settlementAmount) : "£0.00"}</p>
            </div>
            ${content.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      
      toast({
        title: "PDF Generated",
        description: "The analytics report has been exported as PDF."
      });
    } catch (err) {
      toast({
        title: "Print Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  }, [currentMonth, summary, toast]);

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (format === 'pdf') {
      handlePrint();
    } else {
      toast({
        title: "Export not available",
        description: "Only PDF export is available for analytics.",
        variant: "destructive"
      });
    }
  };

  // Helper function to get username by ID
  const getUsernameById = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : `User ${userId}`;
  };

  // Prepare user expense comparison data
  const userExpenseData = {
    labels: summary?.userExpenses ? Object.keys(summary.userExpenses).map(id => {
      const userId = parseInt(id);
      return getUsernameById(userId);
    }) : [],
    datasets: [
      {
        label: "Expenses Paid",
        data: summary?.userExpenses ? Object.values(summary.userExpenses) : [],
        backgroundColor: ["#3B82F6", "#8B5CF6"],
        borderColor: ["#2563EB", "#7C3AED"],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      </div>
      
      <MonthSelector onMonthChange={handleMonthChange} onExport={handleExport} />
      
      <div ref={printRef} className="space-y-6">
        {/* Total expenses card */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Expenses for Month</p>
                <p className="text-4xl font-bold text-primary mt-2">
                  {summary ? formatCurrency(summary.totalExpenses) : "£0.00"}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Settlement: {summary ? formatCurrency(summary.settlementAmount) : "£0.00"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* User comparison chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Expense Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : summary && Object.keys(summary.userExpenses).length > 0 ? (
              <div className="h-64">
                <Bar 
                  data={userExpenseData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return formatCurrency(context.raw as number);
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '£' + value;
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-600">No expense data available for this month.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Category distribution chart */}
        <CategoryChart summary={summary} isLoading={summaryLoading} />
        
        {/* Location distribution chart */}
        <LocationChart summary={summary} isLoading={summaryLoading} />
        
        {/* Split type chart */}
        <SplitTypeChart summary={summary} isLoading={summaryLoading} />
        
        {/* Trends over time chart */}
        <TrendChart trendData={trendData} isLoading={trendLoading} />
      </div>
    </div>
  );
}
