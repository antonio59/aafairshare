import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

interface ChartDataItem {
  name: string;
  value: number;
  percentage?: number;
}

interface PieChartProps {
  title: string;
  data: ChartDataItem[];
  valueFormatter: (value: number) => string;
  customColorFunction?: (name: string) => string;
  totalLabel?: string;
}

export default function PieChart({
  title,
  data,
  valueFormatter,
  customColorFunction,
  totalLabel
}: PieChartProps) {
  // Sort data by value in descending order
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Calculate total if not already provided
  const total = sortedData.reduce((sum, item) => sum + item.value, 0);

  // Calculate percentages if not already provided
  const dataWithPercentages = sortedData.map(item => ({
    ...item,
    percentage: item.percentage !== undefined ? item.percentage : (total > 0 ? (item.value / total) * 100 : 0)
  }));

  // Generate CSS for the pie chart
  const generatePieChartCSS = () => {
    let cumulativePercentage = 0;
    const colorStops = dataWithPercentages.map((item) => {
      const startPercentage = cumulativePercentage;
      cumulativePercentage += item.percentage;
      // Always use the custom color function to ensure consistent colors
      const color = customColorFunction ? customColorFunction(item.name) : '#3b82f6';
      return `${color} ${startPercentage}% ${cumulativePercentage}%`;
    });

    return `conic-gradient(${colorStops.join(', ')})`;
  };

  // Generate tooltip content for each segment
  const generateTooltipContent = (item: ChartDataItem) => {
    return `${item.name}: ${valueFormatter(item.value)} (${item.percentage.toFixed(1)}%)`;
  };

  // Get color for an item
  const getItemColor = (item: ChartDataItem) => {
    return customColorFunction ? customColorFunction(item.name) : '#3b82f6';
  };

  return (
    <Card className="border-gray-200 dark:border-gray-700 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-full">
          {/* Pie chart with labels */}
          <div className="relative w-full max-w-[250px] aspect-square mx-auto">
            <div
              className="w-full h-full rounded-full"
              style={{ background: generatePieChartCSS() }}
            >
              {/* Interactive segments with hover tooltips */}
              {dataWithPercentages.map((item, index) => {
                const segmentAngle = (item.percentage / 100) * 360;
                const startAngle = dataWithPercentages
                  .slice(0, index)
                  .reduce((sum, i) => sum + (i.percentage / 100) * 360, 0);
                const midAngle = startAngle + segmentAngle / 2;
                const radianAngle = (midAngle - 90) * (Math.PI / 180);

                // Calculate position for the label
                const labelRadius = 0.85; // Position labels at 85% of the radius
                const labelX = 50 + labelRadius * 50 * Math.cos(radianAngle);
                const labelY = 50 + labelRadius * 50 * Math.sin(radianAngle);

                // Only show labels for segments that are large enough
                const showLabel = item.percentage >= 8;

                // Create a segment overlay for better interaction
                return (
                  <div
                    key={index}
                    className="absolute inset-0 cursor-pointer z-10 group"
                    onClick={() => {
                      // Only show alert on mobile devices
                      if (window.innerWidth < 768) {
                        alert(`${item.name}: ${valueFormatter(item.value)} (${item.percentage.toFixed(1)}%)`);
                      }
                    }}
                    style={{
                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * (Math.PI / 180))}% ${50 + 50 * Math.sin((startAngle - 90) * (Math.PI / 180))}%, ${50 + 50 * Math.cos((startAngle + segmentAngle - 90) * (Math.PI / 180))}% ${50 + 50 * Math.sin((startAngle + segmentAngle - 90) * (Math.PI / 180))}%)`,
                    }}
                  >
                    {/* Tooltip that appears on hover */}
                    <div className="absolute opacity-0 group-hover:opacity-100 bg-popover text-popover-foreground p-2 rounded shadow-md text-sm pointer-events-none transition-opacity z-50"
                      style={{
                        left: `${50 + 40 * Math.cos(radianAngle)}%`,
                        top: `${50 + 40 * Math.sin(radianAngle)}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {item.name}: {valueFormatter(item.value)} ({item.percentage.toFixed(1)}%)
                    </div>

                    {/* Direct label on the chart for larger segments */}
                    {showLabel && (
                      <div
                        className="absolute text-white text-xs font-bold pointer-events-none"
                        style={{
                          left: `${labelX}%`,
                          top: `${labelY}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        {item.percentage.toFixed(0)}%
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty center hole */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[60%] h-[60%] bg-background rounded-full flex items-center justify-center">
                  {/* Total in the center */}
                  <div className="text-center">
                    <div className="text-lg font-bold">{valueFormatter(total)}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colored text labels instead of dots */}
          <div className="mt-4 w-full grid grid-cols-2 gap-x-2 gap-y-1">
            {dataWithPercentages.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span
                  className="text-xs font-medium truncate mr-1"
                  style={{ color: getItemColor(item) }}
                >
                  {item.name}
                </span>
                <span className="text-xs whitespace-nowrap">
                  {valueFormatter(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
