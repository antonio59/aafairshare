import * as React from "react";
import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const DatePicker = React.forwardRef<
  HTMLButtonElement,
  DatePickerProps
>(({ value, onChange, className, id, name, disabled, minDate, maxDate }, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (date: Date | null) => {
    onChange(date || undefined);
    if (date) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <Button
        ref={ref}
        id={id}
        name={name}
        type="button"
        variant={"outline"}
        onClick={(e) => {
          e.preventDefault(); // Prevent form validation
          e.stopPropagation(); // Stop event propagation
          setIsOpen(!isOpen);
        }}
        className={cn(
          "w-full justify-start text-left font-normal h-12 text-base border-gray-200 dark:border-gray-700",
          !value && "text-muted-foreground",
          className
        )}
        disabled={disabled}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(value) : <span>Pick a date</span>}
      </Button>
      {isOpen && (
        <div
          className="absolute z-[9999] mt-1 w-full"
          onClick={(e) => {
            e.preventDefault(); // Prevent form validation
            e.stopPropagation(); // Stop event propagation
          }}
        >
          <ReactDatePicker
            selected={value}
            onChange={(date) => {
              // Prevent validation when selecting a date
              handleChange(date);
            }}
            inline
            minDate={minDate}
            maxDate={maxDate}
            onClickOutside={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}
            calendarClassName="border border-gray-200 dark:border-gray-700 bg-background rounded-md shadow-md"
            dayClassName={() => "text-center"}
          />
        </div>
      )}
    </div>
  );
});

DatePicker.displayName = "DatePicker";
