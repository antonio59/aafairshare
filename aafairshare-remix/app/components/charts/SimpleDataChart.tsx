import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

interface DataItem {
  name: string;
  value: number;
  percentage?: number;
}

interface SimpleDataTableProps {
  title: string;
  data: DataItem[];
  valueFormatter: (value: number) => string;
  height?: number;
  customColorFunction?: (name: string) => string;
}

export default function SimpleDataTable({
  title,
  data,
  valueFormatter,
  customColorFunction
}: SimpleDataTableProps) {
  // Sort data by value in descending order
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Calculate total if not already provided
  const total = sortedData.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate percentages if not already provided
  const dataWithPercentages = sortedData.map(item => ({
    ...item,
    percentage: item.percentage !== undefined ? item.percentage : (total > 0 ? (item.value / total) * 100 : 0)
  }));

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataWithPercentages.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center">
                    {customColorFunction && (
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: customColorFunction(item.name) }}
                      />
                    )}
                    <span>{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{valueFormatter(item.value)}</TableCell>
                <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
