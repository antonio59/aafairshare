'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, setMonth, setYear } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface MonthSelectorProps {
  value: string;
  onChange: (month: string) => void;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export function MonthSelector({
  value,
  onChange,
  className,
  disabled,
  minDate,
  maxDate
}: MonthSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentDate = React.useMemo(() => new Date(value + '-01'), [value]);

  const isDateDisabled = React.useCallback((date: Date) => {
    if (minDate && date < startOfMonth(minDate)) return true;
    if (maxDate && date > startOfMonth(maxDate)) return true;
    return false;
  }, [minDate, maxDate]);

  const handlePrevMonth = () => {
    const newDate = subMonths(startOfMonth(currentDate), 1);
    if (!isDateDisabled(newDate)) onChange(format(newDate, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const newDate = addMonths(startOfMonth(currentDate), 1);
    if (!isDateDisabled(newDate)) onChange(format(newDate, 'yyyy-MM'));
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setMonth(currentDate, monthIndex);
    if (!isDateDisabled(newDate)) {
      onChange(format(newDate, 'yyyy-MM'));
      setIsOpen(false);
    }
  };

  const handleYearChange = (offset: number) => {
    const newDate = setYear(currentDate, currentDate.getFullYear() + offset);
    if (!isDateDisabled(newDate)) onChange(format(newDate, 'yyyy-MM'));
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          disabled={disabled || isDateDisabled(subMonths(currentDate, 1))}
          className="rounded-l-lg"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous month</span>
        </Button>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              disabled={disabled}
              className={cn(
                'flex-1 px-3 justify-start gap-2 font-normal',
                !value && 'text-muted-foreground'
              )}
            >
              <Calendar className="h-4 w-4 opacity-50" />
              <span>{format(currentDate, 'MMMM yyyy')}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            {/* Year selector */}
            <div className="flex items-center justify-between mb-4 px-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleYearChange(-1)}
                disabled={minDate && currentDate.getFullYear() <= minDate.getFullYear()}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous year</span>
              </Button>
              <span className="font-medium">
                {currentDate.getFullYear()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleYearChange(1)}
                disabled={maxDate && currentDate.getFullYear() >= maxDate.getFullYear()}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next year</span>
              </Button>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((month, index) => {
                const monthDate = setMonth(currentDate, index);
                const isDisabled = isDateDisabled(monthDate);
                const isSelected = index === currentDate.getMonth();

                return (
                  <Button
                    key={month}
                    variant={isSelected ? 'default' : 'ghost'}
                    onClick={() => handleMonthSelect(index)}
                    disabled={isDisabled}
                    className={cn(
                      'h-9 w-full text-sm justify-center',
                      isSelected && 'font-medium',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {month.slice(0, 3)}
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          disabled={disabled || isDateDisabled(addMonths(currentDate, 1))}
          className="rounded-r-lg"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>
    </div>
  );
}
