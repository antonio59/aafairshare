'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DropdownOption {
  label: string;
  value: string;
  icon?: string;
  group?: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
  label?: string;
  groupBy?: boolean;
}

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className,
  error,
  required,
  label,
  groupBy = false,
}: DropdownProps) {
  // Group options if needed
  const groupedOptions = React.useMemo(() => {
    if (!groupBy) return { ungrouped: options };
    
    return options.reduce((acc, option) => {
      const group = option.group || 'Other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(option);
      return acc;
    }, {} as Record<string, DropdownOption[]>);
  }, [options, groupBy]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className={cn(
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        
        <SelectContent>
          {Object.entries(groupedOptions).map(([group, groupOptions]) => (
            <SelectGroup key={group}>
              {groupBy && group !== 'ungrouped' && (
                <SelectLabel>{group}</SelectLabel>
              )}
              
              {groupOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="flex items-center gap-2"
                >
                  {option.icon && (
                    <span className="flex-shrink-0 w-4 h-4">
                      {option.icon}
                    </span>
                  )}
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
