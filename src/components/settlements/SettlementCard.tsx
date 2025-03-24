"use client";

import { format } from "date-fns";
import { useState } from "react";

import type { Settlement } from "@/types/expenses";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface SettlementCardProps {
  settlement: Settlement;
  onStatusChange?: (id: string, status: 'pending' | 'completed') => void;
  className?: string;
}

export function SettlementCard({
  settlement,
  onStatusChange,
  className,
}: SettlementCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const formattedDate = settlement.created_at 
    ? format(new Date(settlement.created_at), "MMM d, yyyy")
    : "";
  
  const statusColor = settlement.status === "completed" 
    ? "bg-green-100 text-green-800 hover:bg-green-200" 
    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
  
  const handleStatusToggle = () => {
    if (onStatusChange) {
      const newStatus = settlement.status === "completed" ? "pending" : "completed";
      onStatusChange(settlement.id, newStatus);
    }
  };

  return (
    <Card 
      className={cn("w-full transition-all duration-200", 
        isHovered && "shadow-md", 
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {settlement.month 
                ? format(new Date(`${settlement.month}-01`), "MMMM yyyy") 
                : "Settlement"}
            </CardTitle>
            <CardDescription>
              Created on {formattedDate}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  className={cn("cursor-pointer transition-colors", statusColor)}
                  onClick={handleStatusToggle}
                >
                  {settlement.status}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to change status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {settlement.amount > 0 ? (
            <p className="text-sm">
              <span className="font-semibold">{settlement.from}</span> owes{" "}
              <span className="font-semibold">{settlement.to}</span>{" "}
              <span className="font-bold text-base">
                ${settlement.amount.toFixed(2)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              No settlement needed for this period
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 text-xs text-gray-500">
        <div className="flex justify-between w-full">
          <span>ID: {settlement.id.substring(0, 8)}...</span>
          {settlement.updated_at && (
            <span>
              Updated: {format(new Date(settlement.updated_at), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
