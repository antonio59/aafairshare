import { useState } from "react";
import { SettlementWithUsers } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
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
  onUnsettlement?: (id: number) => void;
}

export default function SettlementHistory(props: SettlementHistoryProps) {
  const { settlements, isLoading = false, onUnsettlement } = props;
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
        <div className="space-y-4 sm:hidden">
          {settlements.map((settlement) => (
            <div key={settlement.id} className="bg-white p-4 rounded-lg border">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-sm font-medium">{format(new Date(settlement.date), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Month</p>
                  <p className="text-sm font-medium">{format(new Date(settlement.month + "-01"), "MMMM yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="text-sm font-medium">{settlement.fromUser.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="text-sm font-medium">{settlement.toUser.username}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-sm font-medium">{formatCurrency(Number(settlement.amount))}</p>
                </div>
                {onUnsettlement && (
                  <div className="col-span-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => onUnsettlement(settlement.id)} className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Unsettle
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {onUnsettlement && <TableHead />}
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
                  {onUnsettlement && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUnsettlement(settlement.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Unsettle
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
