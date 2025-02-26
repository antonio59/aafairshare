"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value?: string;
  date?: Date;
  onChange?: (date: string) => void;
  setDate?: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({ value, date, onChange, setDate, placeholder = "Pick a date" }: DatePickerProps) {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (setDate) {
      setDate(selectedDate);
    }
    
    if (onChange && selectedDate) {
      onChange(selectedDate.toISOString().split('T')[0]);
    }
  };

  // Convert string value to Date if needed
  const displayDate = date || (value ? new Date(value) : undefined);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayDate ? format(displayDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={displayDate}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
