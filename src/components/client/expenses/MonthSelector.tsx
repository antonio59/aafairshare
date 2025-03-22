'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, parse } from 'date-fns';

export interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  // Parse the string month to a Date object
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    try {
      return parse(selectedMonth, 'yyyy-MM', new Date());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      return new Date();
    }
  });

  // Update the current date when selectedMonth prop changes
  useEffect(() => {
    try {
      const parsedDate = parse(selectedMonth, 'yyyy-MM', new Date());
      setCurrentDate(parsedDate);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      // Handle invalid date format
    }
    
    // Cleanup function (important for React 19)
    return () => {
      // No resources to clean up in this case, but included for best practices
    };
  }, [selectedMonth]);

  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    onMonthChange(format(newDate, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    onMonthChange(format(newDate, 'yyyy-MM'));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      onMonthChange(format(date, 'yyyy-MM'));
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePreviousMonth}
            aria-label="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-lg font-semibold text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextMonth}
            aria-label="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleDateSelect}
          className="rounded-md border mx-auto"
        />
      </CardContent>
    </Card>
  );
}
