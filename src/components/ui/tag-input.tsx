'use client';

import * as React from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './command';
import { cn } from '@/lib/utils';

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  onCreateTag?: (name: string) => Promise<void>;
  availableTags: Tag[];
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  maxTags?: number;
}

export function TagInput({
  value,
  onChange,
  onCreateTag,
  availableTags,
  label,
  required,
  placeholder = 'Add tags...',
  error,
  className,
  disabled,
  maxTags,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const commandRef = React.useRef<HTMLDivElement>(null);

  // Get selected tags with their full data
  const selectedTags = React.useMemo(() => 
    value
      .map(id => availableTags.find(tag => tag.id === id))
      .filter(Boolean) as Tag[],
    [value, availableTags]
  );

  // Filter available tags based on input and already selected tags
  const filteredTags = React.useMemo(() => 
    availableTags.filter(tag => 
      !value.includes(tag.id) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
    ),
    [availableTags, value, inputValue]
  );

  // Handle keyboard navigation
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' && inputValue && !e.shiftKey) {
      e.preventDefault();

      // Check max tags limit
      if (maxTags && selectedTags.length >= maxTags) {
        return;
      }

      if (filteredTags.length > 0) {
        // Select first filtered tag
        onChange([...value, filteredTags[0].id]);
        setInputValue('');
        setIsOpen(false);
      } else if (onCreateTag) {
        // Create new tag if allowed
        setIsCreating(true);
        try {
          await onCreateTag(inputValue);
          const newTag = availableTags.find(tag => tag.name.toLowerCase() === inputValue.toLowerCase());
          if (newTag) {
            onChange([...value, newTag.id]);
          }
        } catch (error) {
          console.error('Failed to create tag:', error);
        } finally {
          setIsCreating(false);
          setInputValue('');
          setIsOpen(false);
        }
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag
      onChange(value.slice(0, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Handle input changes
  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsOpen(true);
  };

  // Handle tag removal
  const removeTag = (tagId: string) => {
    if (!disabled) {
      onChange(value.filter(id => id !== tagId));
    }
  };

  // Handle tag selection
  const handleSelect = (tagId: string) => {
    if (disabled || (maxTags && selectedTags.length >= maxTags)) return;
    
    onChange([...value, tagId]);
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative space-y-1', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          'rounded-md border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring',
          error && 'border-red-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex flex-wrap gap-1 p-1">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm',
                tag.color ? `bg-${tag.color}-100 text-${tag.color}-800` : 'bg-blue-100 text-blue-800'
              )}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className={cn(
                  'hover:bg-blue-200 rounded-full p-0.5',
                  disabled && 'cursor-not-allowed'
                )}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag.name}</span>
              </button>
            </span>
          ))}

          <Command ref={commandRef} className="relative flex-1 min-w-[8rem]">
            <CommandInput
              ref={inputRef}
              value={inputValue}
              onValueChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || (maxTags && selectedTags.length >= maxTags)}
              className="h-8 px-2 py-1 text-sm focus:outline-none"
            />

            {isOpen && (
              <div className="absolute z-50 w-full top-full mt-1 bg-popover rounded-md border shadow-md">
                <CommandEmpty className="py-6 text-center text-sm">
                  {onCreateTag ? (
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Plus className="h-4 w-4" />
                      Press enter to create &quot;{inputValue}&quot;
                    </div>
                  ) : (
                    'No tags found.'
                  )}
                </CommandEmpty>

                <CommandGroup>
                  {filteredTags.map(tag => (
                    <CommandItem
                      key={tag.id}
                      value={tag.id}
                      onSelect={handleSelect}
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                    >
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          tag.color ? `bg-${tag.color}-500` : 'bg-blue-500'
                        )}
                      />
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            )}
          </Command>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {isCreating && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}
