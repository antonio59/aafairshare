import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../utils/useClickOutside';

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    label: string;
    value: string;
    icon?: string;
    group?: string;
  }>;
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
  label?: string;
  groupBy?: boolean;
}

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  error,
  required,
  label,
  groupBy = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), [buttonRef]);

  const selectedOption = options.find(option => option.value === value);

  const groupedOptions = groupBy
    ? options.reduce((groups, option) => {
        const group = option.group || 'Other';
        return {
          ...groups,
          [group]: [...(groups[group] || []), option],
        };
      }, {} as Record<string, typeof options>)
    : null;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2 text-left bg-white border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors min-h-[42px]
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${isOpen ? 'ring-2 ring-blue-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            {selectedOption?.icon && <span>{selectedOption.icon}</span>}
            <span className={!selectedOption ? 'text-gray-500' : ''}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {groupBy && groupedOptions ? (
            Object.entries(groupedOptions).map(([group, groupOptions]) => (
              <div key={group} className="border-b border-gray-100 last:border-b-0">
                <div className="sticky top-0 px-4 py-2 bg-gray-100 text-sm font-semibold text-gray-800 cursor-default select-none">
                  {group}
                </div>
                {groupOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-6 py-2 text-left flex items-center gap-2
                      hover:bg-gray-50 transition-colors text-sm
                      ${value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                    `}
                  >
                    {option.icon && <span>{option.icon}</span>}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            ))
          ) : (
            options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left flex items-center gap-2
                  hover:bg-gray-50 transition-colors text-sm
                  ${value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                `}
              >
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
