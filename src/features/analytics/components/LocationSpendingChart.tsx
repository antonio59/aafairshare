'use client';

import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { LocationData, AnalyticsChartProps } from '../types';

interface LocationWithPercentage extends LocationData {
  percentage: number;
  isOther?: boolean;
}

interface LocationSpendingChartProps extends Omit<AnalyticsChartProps, 'data'> {
  locations: LocationData[];
  formatAmount: (amount: number) => string;
}

export function LocationSpendingChart({
  locations,
  formatAmount,
  title = 'Spending by Location',
  loading = false,
  error = null,
  className = ''
}: LocationSpendingChartProps) {
  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-2 mt-6">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded-full w-full"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm text-center ${className}`}>
        <MapPin className="mx-auto h-8 w-8 text-red-400 mb-2" />
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm text-center ${className}`}>
        <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No location data available</p>
      </div>
    );
  }

  // Sort locations by amount (highest first)
  const sortedLocations = [...locations].sort((a, b) => b.amount - a.amount);
  
  // Calculate total amount
  const totalAmount = sortedLocations.reduce((sum, loc) => sum + loc.amount, 0);
  
  // Calculate percentages and prepare data for visualization
  const locationsWithPercentage: LocationWithPercentage[] = sortedLocations.map(loc => ({
    ...loc,
    percentage: (loc.amount / totalAmount) * 100
  }));

  // Show top 5 locations and group others
  const topLocations = locationsWithPercentage.slice(0, 5);
  const otherLocations = locationsWithPercentage.slice(5);
  
  // Create a consolidated "Other" category if necessary
  const hasOthers = otherLocations.length > 0;
  const otherLocationAmount = otherLocations.reduce((sum, loc) => sum + loc.amount, 0);
  const otherLocationPercentage = (otherLocationAmount / totalAmount) * 100;
  
  // Final data for visualization
  const visualizationData: LocationWithPercentage[] = [
    ...topLocations,
    ...(hasOthers ? [{
      location: `Other (${otherLocations.length} locations)`,
      amount: otherLocationAmount,
      percentage: otherLocationPercentage,
      isOther: true
    }] : [])
  ];

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-800 flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-rose-500" />
          {title}
        </h3>
        <span className="font-medium text-gray-800">
          {formatAmount(totalAmount)}
        </span>
      </div>
      
      {/* Horizontal bar chart */}
      <div className="space-y-4 mt-6">
        {visualizationData.map((location, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium truncate max-w-[250px]">
                {location.location}
              </span>
              <span className="text-sm text-gray-600">
                {formatAmount(location.amount)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 relative">
              <div 
                className={`absolute top-0 left-0 h-3 rounded-full ${location.isOther ? 'bg-gray-400' : 'bg-rose-500'}`}
                style={{ width: `${location.percentage}%` }}
              />
              <span 
                className="absolute top-0 right-2 text-[10px] font-medium text-white leading-3"
                style={{ 
                  lineHeight: '12px',
                  display: location.percentage > 10 ? 'block' : 'none'
                }}
              >
                {location.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Location metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Most Frequent</p>
          <p className="text-sm font-medium mt-1 truncate">
            {topLocations[0]?.location || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {topLocations[0] ? formatAmount(topLocations[0].amount) : 'N/A'}
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Total Locations</p>
          <p className="text-sm font-medium mt-1">
            {locations.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            unique places
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Avg. per Location</p>
          <p className="text-sm font-medium mt-1">
            {formatAmount(totalAmount / (locations.length || 1))}
          </p>
        </div>
      </div>
      
      {/* Location details */}
      {hasOthers && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <ArrowRight className="h-4 w-4 mr-1" />
            Other Locations
          </h4>
          <div className="max-h-40 overflow-y-auto text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              {otherLocations.map((location, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate max-w-[70%]">{location.location}</span>
                  <span className="text-gray-600">{formatAmount(location.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 