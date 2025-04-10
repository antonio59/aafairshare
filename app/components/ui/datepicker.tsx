import React, { forwardRef, useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import "~/styles/datepicker.css";

interface CustomDatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function CustomDatePicker({
  date,
  setDate,
  className,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close the datepicker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Custom input component
  const CustomInput = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
    ({ value, onClick }, ref) => (
      <Button
        ref={(node) => {
          // Pass the ref to both our local ref and the one from DatePicker
          buttonRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        onClick={() => {
          setIsOpen(!isOpen);
          onClick && onClick({} as React.MouseEvent<HTMLButtonElement>);
        }}
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal h-12 text-base border-gray-200 dark:border-gray-700",
          !value && "text-muted-foreground",
          className
        )}
        disabled={disabled}
        type="button"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? value : <span>{placeholder}</span>}
      </Button>
    )
  );

  CustomInput.displayName = "CustomDatePickerInput";

  return (
    <DatePicker
      selected={date}
      onChange={(date: Date | null) => {
        setDate(date || undefined);
        setIsOpen(false);
      }}
      onClickOutside={() => setIsOpen(false)}
      open={isOpen}
      customInput={<CustomInput />}
      dateFormat="MMMM d, yyyy"
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      calendarClassName="bg-background border border-gray-200 dark:border-gray-700 rounded-md shadow-md"
      wrapperClassName="w-full"
      popperClassName="z-50"
      popperPlacement="bottom"
      shouldCloseOnSelect={true}
      popperModifiers={[
        {
          name: "preventOverflow",
          options: {
            boundary: typeof document !== 'undefined' ? document.body : null,
            padding: 20,
          },
        },
        {
          name: "offset",
          options: {
            offset: [0, 8],
          },
        },
      ]}
    />
  );
}
