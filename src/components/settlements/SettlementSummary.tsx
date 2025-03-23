'use client';

import * as React from 'react';
import { useState } from 'react';
import { format } from 'date-fns';
import { createStandardBrowserClient } from '@/utils/supabase-client';
import { CheckCircle2, ArrowRight, AlarmClock, Loader2 } from 'lucide-react';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

// Import types
import type { Settlement } from '@/types/expenses';

export interface SettlementSummaryProps {
  settlements: Settlement[];
  month: string;
  onSettlementUpdated?: (settlementId: string, status: Settlement['status']) => void;
}

export function SettlementSummary({ settlements, month, onSettlementUpdated }: SettlementSummaryProps): React.JSX.Element {
  const [updatingSettlementId, setUpdatingSettlementId] = useState<string | null>(null);
  const totalSettlements = settlements.reduce((sum, s) => sum + s.amount, 0);
  const formattedMonth = format(new Date(month), 'MMMM yyyy');
  const pendingSettlements = settlements.filter(s => s.status === 'pending');
  const _completedSettlements = settlements.filter(s => s.status === 'completed');
  
  const supabase = createStandardBrowserClient();
  
  async function handleSettlementStatusUpdate(settlementId: string, newStatus: 'pending' | 'completed') {
    try {
      setUpdatingSettlementId(settlementId);
      
      // Update the settlement status in the database
      const { error } = await supabase
        .from('settlements')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', settlementId);
      
      if (error) throw error;
      
      // Notify parent component
      if (onSettlementUpdated) {
        onSettlementUpdated(settlementId, newStatus);
      }
    } catch (error) {
      console.error('Error updating settlement status:', error);
    } finally {
      setUpdatingSettlementId(null);
    }
  }

  return (
    <Card className="w-full" data-testid="settlement-summary">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Settlements for {formattedMonth}
        </CardTitle>
        <CardDescription>
          {pendingSettlements.length > 0 ? (
            <span className="text-amber-600 dark:text-amber-400">
              {pendingSettlements.length} pending settlement{pendingSettlements.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-green-600 dark:text-green-400">
              All settlements completed
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-4">
            {settlements.map((settlement, index) => (
              <div
                key={`${settlement.from}-${settlement.to}-${index}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                data-testid={`settlement-item-${index}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none" data-testid={`settlement-users-${index}`}>
                      {settlement.from} <ArrowRight className="inline h-3 w-3 mx-1" /> {settlement.to}
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant={settlement.status === 'completed' ? 'outline' : 'default'} className={settlement.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300'}>
                            {settlement.status === 'completed' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <AlarmClock className="h-3 w-3 mr-1" />
                            )}
                            {settlement.status}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {settlement.status === 'completed' 
                              ? `Marked as paid on ${settlement.updated_at ? format(new Date(settlement.updated_at), 'dd MMM yyyy') : 'unknown date'}` 
                              : 'Payment pending'
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created: {settlement.created_at ? format(new Date(settlement.created_at), 'dd MMM yyyy') : 'unknown date'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${settlement.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    £{settlement.amount.toFixed(2)}
                  </span>
                  {settlement.status === 'pending' ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 border-green-200 bg-green-100 text-green-800 hover:bg-green-200 dark:border-green-800 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      onClick={() => handleSettlementStatusUpdate(settlement.id, 'completed')}
                      disabled={updatingSettlementId === settlement.id}
                    >
                      {updatingSettlementId === settlement.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      Mark Paid
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8"
                      onClick={() => handleSettlementStatusUpdate(settlement.id, 'pending')}
                      disabled={updatingSettlementId === settlement.id}
                    >
                      {updatingSettlementId === settlement.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <AlarmClock className="h-3 w-3 mr-1" />
                      )}
                      Undo
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 flex justify-between border-t pt-4">
          <span className="text-sm font-medium">Total Settlements</span>
          <span className="text-sm font-bold">£{totalSettlements.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
