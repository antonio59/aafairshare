'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from './badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './command';

export type Option = {
  value: string;
  label: string;
  icon?: string;
  group?: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  label,
  className,
}: MultiSelectProps) {

  const [inputValue, setInputValue] = React.useState('');

  const selectedOptions = options.filter((option) => selected.includes(option.value));
  const groupedOptions = React.useMemo(() => {
    const groups: { [key: string]: Option[] } = {};
    options.forEach((option) => {
      const group = option.group || 'Other';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
    });
    return groups;
  }, [options]);

  const handleSelect = React.useCallback(
    (value: string) => {
      const option = options.find((o) => o.value === value);
      if (!option) return;

      const updatedSelected = selected.includes(value)
        ? selected.filter((s) => s !== value)
        : [...selected, value];

      onChange(updatedSelected);
    },
    [options, selected, onChange]
  );

  const handleRemove = React.useCallback(
    (value: string) => {
      onChange(selected.filter((s) => s !== value));
    },
    [selected, onChange]
  );

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Command className={`overflow-visible bg-white ${className}`}>
        <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <div className="flex gap-1 flex-wrap">
            {selectedOptions.map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {option.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRemove(option.value);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleRemove(option.value)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
            <CommandInput
              placeholder={placeholder}
              value={inputValue}
              onValueChange={setInputValue}
              className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && (
            <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandEmpty>No results found.</CommandEmpty>
              {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <CommandGroup key={group} heading={group}>
                  {groupOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleSelect}
                    >
                      <div className="flex items-center gap-2">
                        {option.icon && <span>{option.icon}</span>}
                        <span>{option.label}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </div>
          )}
        </div>
      </Command>
    </div>
  );
}
