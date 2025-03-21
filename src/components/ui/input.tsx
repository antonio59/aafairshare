import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input component props
 * Extends the standard HTML input attributes with additional properties
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional flag to indicate if the input is part of a form that's currently being submitted
   * This is useful for disabling the input during form submission
   */
  isSubmitting?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
