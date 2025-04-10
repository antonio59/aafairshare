import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { formatCurrency } from '~/lib/utils';

interface TrendData {
  months: string[];
  totals: number[];
  categoryData?: Record<string, number[]>;
  locationData?: Record<string, number[]>;
}

interface SimpleTrendChartProps {
  trendData: TrendData;
  isLoading?: boolean;
}

export default function SimpleTrendChart({ trendData, isLoading = false }: SimpleTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Monthly Expense Trends</CardTitle>
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
          <CardTitle>Monthly Expense Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No trend data available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Monthly Expense Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Total Expenses</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trendData.months.map((month, index) => (
              <TableRow key={month}>
                <TableCell>{month}</TableCell>
                <TableCell className="text-right">{formatCurrency(trendData.totals[index])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
