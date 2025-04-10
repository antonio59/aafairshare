import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { formatCurrency } from '~/lib/utils';
import { format } from 'date-fns';

interface TrendData {
  months: string[];
  totals: number[];
  categoryData?: Record<string, number[]>;
  locationData?: Record<string, number[]>;
}

interface LineChartProps {
  trendData: TrendData;
  isLoading?: boolean;
  title?: string;
}

export default function LineChart({
  trendData,
  isLoading = false,
  title = "Monthly Expense Trends"
}: LineChartProps) {
  if (isLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading trend data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trendData || !trendData.months || trendData.months.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No trend data available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format month labels for display
  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Find the maximum value for scaling
  const maxValue = Math.max(...trendData.totals);
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Use percentage-based calculations for responsive width
  const getXPosition = (index: number) => {
    const totalPoints = Math.max(1, trendData.months.length - 1);
    const availableWidth = 100 - padding.left - padding.right;
    const position = padding.left + (index / totalPoints) * availableWidth;
    return `${position}%`;
  };

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="w-full">
            {/* Chart */}
            <div className="relative h-[250px]">
              <svg
                width="100%"
                height={chartHeight + padding.bottom}
                className="overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Y-axis grid lines and labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = padding.top + innerHeight - (ratio * innerHeight);
                  const value = maxValue * ratio;
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + innerWidth}
                        y2={y}
                        stroke="#e5e7eb"
                        strokeDasharray={ratio > 0 ? "4" : "0"}
                      />
                      <text
                        x={padding.left - 5}
                        y={y}
                        textAnchor="end"
                        dominantBaseline="middle"
                        className="text-xs fill-gray-500"
                      >
                        {formatCurrency(value)}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis and labels */}
                <line
                  x1={`${padding.left}%`}
                  y1={padding.top + innerHeight}
                  x2={`${100 - padding.right}%`}
                  y2={padding.top + innerHeight}
                  stroke="#e5e7eb"
                />

                {trendData.months.map((month, i) => {
                  const x = getXPosition(i);
                  return (
                    <g key={i}>
                      <text
                        x={x}
                        y={padding.top + innerHeight + 20}
                        textAnchor="middle"
                        className="text-xs fill-gray-500"
                      >
                        {formatMonthLabel(month)}
                      </text>
                    </g>
                  );
                })}

                {/* Area under the line */}
                <path
                  d={`
                    M ${padding.left}% ${padding.top + innerHeight}
                    ${trendData.months.map((_, i) => {
                      const x = getXPosition(i);
                      const y = padding.top + innerHeight - (trendData.totals[i] / (maxValue || 1)) * innerHeight;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                    L ${100 - padding.right}% ${padding.top + innerHeight}
                    Z
                  `}
                  fill="rgba(59, 130, 246, 0.1)"
                />

                {/* Line */}
                <path
                  d={`
                    M ${trendData.months.map((_, i) => {
                      const x = getXPosition(i);
                      const y = padding.top + innerHeight - (trendData.totals[i] / (maxValue || 1)) * innerHeight;
                      return `${i === 0 ? '' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                  `}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Data points */}
                {trendData.months.map((month, i) => {
                  const x = getXPosition(i);
                  const y = padding.top + innerHeight - (trendData.totals[i] / (maxValue || 1)) * innerHeight;
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="white"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill="transparent"
                        stroke="transparent"
                        className="cursor-pointer"
                      >
                        <title>{formatMonthLabel(month)}: {formatCurrency(trendData.totals[i])}</title>
                      </circle>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Data table */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Monthly Totals</h3>
          <div className="grid grid-cols-2 gap-2">
            {trendData.months.map((month, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm">{formatMonthLabel(month)}</span>
                <span className="text-sm font-medium">{formatCurrency(trendData.totals[i])}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
