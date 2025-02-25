'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './command';
import { cn } from '@/lib/utils';

interface EnhancedSelectOption {
  label: string;
  value: string;
  icon?: string;
  group?: string;
}

interface EnhancedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: EnhancedSelectOption[];
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
  label?: string;
  groupBy?: boolean;
  searchable?: boolean;
}

export function EnhancedSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className,
  error,
  required,
  label,
  groupBy = false,
  searchable = false,
}: EnhancedSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  // Group options if needed
  const groupedOptions = React.useMemo(() => {
    if (!groupBy) return { 'Options': filteredOptions };
    return filteredOptions.reduce((groups, option) => {
      const group = option.group || 'Other';
      return {
        ...groups,
        [group]: [...(groups[group] || []), option],
      };
    }, {} as Record<string, EnhancedSelectOption[]>);
  }, [filteredOptions, groupBy]);

  // Get selected option details
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Command className={cn('relative', className)}>
        <div
          className={cn(
            'flex items-center justify-between px-3 py-2 border rounded-md',
            error ? 'border-red-500' : 'border-gray-300',
            'hover:border-gray-400 focus-within:border-primary'
          )}
          onClick={() => setOpen(!open)}
        >
          <span className="flex items-center gap-2">
            {selectedOption?.icon && <span>{selectedOption.icon}</span>}
            <span className={!value ? 'text-gray-500' : ''}>
              {selectedOption?.label || placeholder}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </div>
        
        {open && (
          <div className="absolute w-full z-50 top-full mt-1 bg-white rounded-md border shadow-lg">
            {searchable && (
              <div className="p-2 border-b">
                <div className="flex items-center px-2">
                  <Search className="h-4 w-4 opacity-50" />
                  <CommandInput
                    placeholder="Search..."
                    value={search}
                    onValueChange={setSearch}
                    className="ml-2 outline-none placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-60 overflow-auto">
              {filteredOptions.length === 0 ? (
                <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                  No results found.
                </CommandEmpty>
              ) : (
                Object.entries(groupedOptions).map(([group, groupOptions]) => (
                  <CommandGroup key={group} heading={groupBy ? group : undefined}>
                    {groupOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          onChange(option.value);
                          setOpen(false);
                          setSearch('');
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer"
                      >
                        {option.icon && <span>{option.icon}</span>}
                        <span>{option.label}</span>
                        {value === option.value && (
                          <Check className="h-4 w-4 ml-auto opacity-50" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))
              )}
            </div>
          </div>
        )}
      </Command>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
