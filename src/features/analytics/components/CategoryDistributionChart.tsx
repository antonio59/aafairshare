'use client';

import React from 'react';
import { PieChart, _DollarSign } from 'lucide-react';

interface CategoryData {
  category: string;
  amount: number;
}

interface CategoryDistributionChartProps {
  categories: CategoryData[];
  formatAmount: (amount: number) => string;
  title?: string;
}

export function CategoryDistributionChart({
  categories,
  formatAmount,
  title = 'Category Distribution'
}: CategoryDistributionChartProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <PieChart className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No category data available</p>
      </div>
    );
  }

  // Sort categories by amount (highest first)
  const sortedCategories = [...categories].sort((a, b) => b.amount - a.amount);
  
  // Calculate total
  const totalAmount = sortedCategories.reduce((sum, cat) => sum + cat.amount, 0);
  
  // Calculate percentages and prepare data for the chart
  const chartData = sortedCategories.map(cat => ({
    ...cat,
    percentage: (cat.amount / totalAmount) * 100
  }));

  // Generate colors for categories
  const generateColor = ( _index: number, _total: number) => {
    // Base color is rose-500 (#f43f5e)
    // Generate variants based on index position
    const baseHue = 350; // Rose hue
    const hueStep = 10;
    const lightnessBase = 55;
    const lightnessStep = 5;
    
    // Calculate a unique hue and lightness for each category
    const hue = (baseHue + (_index * hueStep)) % 360;
    const lightness = Math.max(30, lightnessBase - (_index * lightnessStep));
    
    return `hsl(${hue}, 80%, ${lightness}%)`;
  };

  // Prepare segment data with colors and angles
  const segments = chartData.map((cat, _index) => {
    const color = generateColor(_index, chartData.length);
    return {
      ...cat,
      color,
    };
  });

  // Helper function to create pie chart segments
  const createSegments = () => {
    let currentAngle = 0;
    
    return segments.map((segment, _index) => {
      const angle = (segment.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      // Convert angles to radians for calculation
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      
      // Calculate path coordinates
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);
      
      // Determine if the arc should take the long path (> 180 degrees)
      const largeArc = angle > 180 ? 1 : 0;
      
      // Create SVG path
      const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      currentAngle += angle;
      
      return {
        ...segment,
        path,
        startAngle,
        endAngle
      };
    });
  };

  const pieSegments = createSegments();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-800 flex items-center">
          <PieChart className="mr-2 h-5 w-5 text-rose-500" />
          {title}
        </h3>
        <span className="font-medium text-gray-800">
          {formatAmount(totalAmount)}
        </span>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <div className="relative w-48 h-48 mx-auto">
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full transform -rotate-90"
            >
              {pieSegments.map((segment, i) => (
                <path
                  key={i}
                  d={segment.path}
                  fill={segment.color}
                  stroke="#ffffff"
                  strokeWidth="1"
                >
                  <title>{segment.category}: {formatAmount(segment.amount)} ({segment.percentage.toFixed(1)}%)</title>
                </path>
              ))}
              
              {/* Center circle for donut chart effect */}
              <circle cx="50" cy="50" r="20" fill="white" />
              
              {/* Total in center */}
              <text 
                x="50" 
                y="48" 
                textAnchor="middle" 
                fontSize="6" 
                fontWeight="bold" 
                fill="#374151"
                className="transform rotate-90"
              >
                {formatAmount(totalAmount).replace(/[^\d,.]/g, '')}
              </text>
              <text 
                x="50" 
                y="56" 
                textAnchor="middle" 
                fontSize="4" 
                fill="#6b7280"
                className="transform rotate-90"
              >
                TOTAL
              </text>
            </svg>
          </div>
        </div>
        
        {/* Category breakdown */}
        <div className="flex-grow">
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {segments.map((segment, _index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-sm mr-3 flex-shrink-0" 
                  style={{ backgroundColor: segment.color }}
                />
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center text-sm">
                    <p className="font-medium text-gray-700 truncate">
                      {segment.category}
                    </p>
                    <p className="ml-4 text-gray-700 flex-shrink-0">
                      {formatAmount(segment.amount)}
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                    <div 
                      className="h-1 rounded-full" 
                      style={{ 
                        width: `${segment.percentage}%`, 
                        backgroundColor: segment.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Summary statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Largest Category</p>
          <p className="text-sm font-medium mt-1">{chartData[0]?.category || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">{chartData[0] ? `${chartData[0].percentage.toFixed(1)}%` : '0%'}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Category Count</p>
          <p className="text-sm font-medium mt-1">{chartData.length}</p>
          <p className="text-xs text-gray-500 mt-1">categories</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Average/Category</p>
          <p className="text-sm font-medium mt-1">
            {formatAmount(totalAmount / (chartData.length || 1))}
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Top 3 Categories</p>
          <p className="text-sm font-medium mt-1">
            {formatAmount(chartData.slice(0, 3).reduce((sum, cat) => sum + cat.amount, 0))}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {(chartData.slice(0, 3).reduce((sum, cat) => sum + cat.percentage, 0)).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
} 