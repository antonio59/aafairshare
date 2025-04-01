import * as React from "react";
// Removed format import from date-fns
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils"; // Added formatDate
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Accept RHF field props directly
interface DatePickerProps {
  value?: Date; // Expect 'value' from RHF field
  onChange: (date: Date | undefined) => void; // Expect 'onChange' from RHF field
  className?: string;
  id?: string;
  name?: string;
}

// Wrap with forwardRef
export const DatePicker = React.forwardRef<
  HTMLButtonElement, // The type of the element the ref will point to (the Button)
  DatePickerProps
>(({ value, onChange, className, id, name }, ref) => { // Accept ref as second argument
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={ref} // Pass the ref to the Button
          id={id}
          name={name}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground", // Use value
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDate(value) : <span>Pick a date</span>} {/* Use formatDate */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value} // Use value
          onSelect={onChange} // Use onChange
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
});
DatePicker.displayName = "DatePicker"; // Add display name for better debugging
