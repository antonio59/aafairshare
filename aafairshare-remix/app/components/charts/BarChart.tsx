import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

interface DataItem {
  name: string;
  value: number;
  percentage?: number;
}

interface BarChartProps {
  title: string;
  data: DataItem[];
  valueFormatter: (value: number) => string;
  customColorFunction?: (name: string) => string;
}

export default function BarChart({
  title,
  data,
  valueFormatter,
  customColorFunction
}: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Sort data by value in descending order
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Calculate total if not already provided
  const total = sortedData.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate percentages if not already provided
  const dataWithPercentages = sortedData.map(item => ({
    ...item,
    percentage: item.percentage !== undefined ? item.percentage : (total > 0 ? (item.value / total) * 100 : 0)
  }));

  // Find the maximum value for scaling
  const maxValue = Math.max(...dataWithPercentages.map(item => item.value));

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dataWithPercentages.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {customColorFunction && (
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: customColorFunction(item.name) }}
                    />
                  )}
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{valueFormatter(item.value)}</span>
                  <span className="text-xs text-gray-500">({item.percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: customColorFunction ? customColorFunction(item.name) : '#3b82f6'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
