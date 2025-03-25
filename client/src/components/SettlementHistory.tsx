import { useState } from "react";
import { SettlementWithUsers } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SettlementHistoryProps {
  settlements: SettlementWithUsers[];
  isLoading?: boolean;
}

export default function SettlementHistory({ settlements, isLoading = false }: SettlementHistoryProps) {
  // Display loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display empty state
  if (settlements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-gray-600">No settlements recorded yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.map((settlement) => (
                <TableRow key={settlement.id}>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(settlement.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(settlement.month + "-01"), "MMMM yyyy")}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-800">
                    {settlement.fromUser.username}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-800">
                    {settlement.toUser.username}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-800 text-right">
                    {formatCurrency(Number(settlement.amount))}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUnsettlement(settlement.id)}
                    >
                      Unsettle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
