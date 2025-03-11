'use client';

import React from 'react';
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, _Calendar 
} from 'lucide-react';
import { _formatDecimal } from '../../../utils/number-utils';

interface TrendData {
  date: string;
  amount: number;
}

interface ExpenseTrendChartProps {
  trendData: TrendData[];
  formatAmount: (amount: number) => string;
  title?: string;
}

export function ExpenseTrendChart({ 
  trendData, 
  formatAmount, 
  title = 'Monthly Spending Trends'
}: ExpenseTrendChartProps) {
  // Debug logs for incoming data
  console.log('ExpenseTrendChart received trendData:', trendData);
  
  if (!trendData || trendData.length === 0) {
    console.log('No trend data available');
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <TrendingUp className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No trend data available</p>
      </div>
    );
  }

  // Sort data chronologically
  const sortedData = [...trendData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  console.log('Sorted trend data:', sortedData);
  
  // Group expenses by month
  const monthlyData: Record<string, number> = {};
  sortedData.forEach(item => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    console.log(`Adding ${item.amount} to month ${monthKey} (from date ${item.date})`);
    monthlyData[monthKey] += item.amount;
  });
  console.log('Grouped monthly data:', monthlyData);
  
  // Convert monthly data to array
  const monthlyTrends = Object.keys(monthlyData).map(monthKey => {
    const [year, month] = monthKey.split('-').map(Number);
    return {
      date: new Date(year, month - 1, 15).toISOString().split('T')[0], // Middle of month as representative date
      amount: monthlyData[monthKey],
      label: new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  console.log('Monthly trends data for visualization:', monthlyTrends);
  
  // Use monthly trends for visualization
  const trendDataForViz = monthlyTrends;
  
  // Get the first and last points to calculate overall trend
  const firstPoint = trendDataForViz[0];
  const lastPoint = trendDataForViz[trendDataForViz.length - 1];
  
  // Calculate if trend is increasing or decreasing
  const isIncreasing = lastPoint.amount > firstPoint.amount;
  
  // Calculate percentage change
  const percentChange = firstPoint.amount === 0 
    ? 0 
    : ((lastPoint.amount - firstPoint.amount) / firstPoint.amount) * 100;
  
  // Find highest and lowest points
  const highestPoint = trendDataForViz.reduce(
    (max, point) => point.amount > max.amount ? point : max, 
    trendDataForViz[0]
  );
  
  const lowestPoint = trendDataForViz.reduce(
    (min, point) => point.amount < min.amount ? point : min, 
    trendDataForViz[0]
  );

  // Calculate 3-month moving average if enough data
  const movingAverages = trendDataForViz.length >= 3 
    ? trendDataForViz.map((_, index, array) => {
        if (index < 2) return null;
        
        // Calculate 3-month average
        const sum = array
          .slice(index - 2, index + 1)
          .reduce((acc, point) => acc + point.amount, 0);
          
        return {
          date: array[index].date,
          average: sum / 3
        };
      }).filter(Boolean)
    : [];

  // Calculate max value for chart scaling
  const maxValue = Math.max(...trendDataForViz.map(point => point.amount));
  
  // Format a date to show month name
  const _formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-800 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-rose-500" />
          {title}
        </h3>
        
        <div className={`flex items-center ${isIncreasing ? 'text-red-500' : 'text-green-500'}`}>
          {isIncreasing ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          <span className="text-sm font-medium">
            {Math.abs(percentChange).toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* Monthly Expense Trend Chart */}
      <div className="h-48 relative mt-6 mb-8">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500">
          <span>{formatAmount(maxValue)}</span>
          <span>{formatAmount(maxValue / 2)}</span>
          <span>{formatAmount(0)}</span>
        </div>
        
        {/* Chart area */}
        <div className="absolute left-12 right-0 top-0 bottom-0 flex items-end">
          <div className="w-full h-full relative border-b border-l border-gray-200">
            {/* Grid lines */}
            <div className="absolute w-full h-1/2 border-b border-gray-100"></div>
            
            {/* Data points and connecting lines */}
            <svg className="absolute inset-0 w-full h-full" 
                preserveAspectRatio="none"
                viewBox={`0 0 ${trendDataForViz.length} 100`}>
              {/* Line connecting all points */}
              <polyline
                points={trendDataForViz.map((point, i) => 
                  `${i}, ${100 - (point.amount / maxValue) * 100}`
                ).join(' ')}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              
              {/* Area under the line */}
              <polygon
                points={`
                  0,100 
                  ${trendDataForViz.map((point, i) => 
                    `${i},${100 - (point.amount / maxValue) * 100}`
                  ).join(' ')} 
                  ${trendDataForViz.length - 1},100
                `}
                fill="url(#trendGradient)"
                opacity="0.2"
              />
              
              {/* Moving average line if available */}
              {movingAverages.length > 0 && (
                <polyline
                  points={movingAverages.map((point, i) => 
                    `${i + 2}, ${100 - ((point?.average || 0) / maxValue) * 100}`
                  ).join(' ')}
                  fill="none"
                  stroke="#9f1239"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />
              )}
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* X-axis labels - show month labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between -mb-6 px-2 text-xs text-gray-500">
              {trendDataForViz.map((point, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span>{point.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Start</p>
          <p className="text-sm font-medium mt-1">{formatAmount(firstPoint.amount)}</p>
          <p className="text-xs text-gray-400 mt-1">{firstPoint.label}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Latest</p>
          <p className="text-sm font-medium mt-1">{formatAmount(lastPoint.amount)}</p>
          <p className="text-xs text-gray-400 mt-1">{lastPoint.label}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Highest Month</p>
          <p className="text-sm font-medium mt-1 text-red-500">{formatAmount(highestPoint.amount)}</p>
          <p className="text-xs text-gray-400 mt-1">{highestPoint.label}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Lowest Month</p>
          <p className="text-sm font-medium mt-1 text-green-500">{formatAmount(lowestPoint.amount)}</p>
          <p className="text-xs text-gray-400 mt-1">{lowestPoint.label}</p>
        </div>
      </div>
    </div>
  );
} 