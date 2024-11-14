import React, { useRef, useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useClickOutside } from '@/utils/useClickOutside';

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

interface GroupedOptions {
  [key: string]: DropdownOption[];
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  error,
  required,
  label,
  groupBy = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
    setSearchText('');
    setHighlightedIndex(-1);
  }, [buttonRef]);

  const selectedOption = options.find(option => option.value === value);

  // Filter options based on search text
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchText.toLowerCase())
  );

  const groupedOptions = groupBy
    ? filteredOptions.reduce((groups, option) => {
        const group = option.group || 'Other';
        return {
          ...groups,
          [group]: [...(groups[group] || []), option],
        };
      }, {} as GroupedOptions)
    : null;

  // Flatten grouped options for keyboard navigation
  const flattenedOptions = groupBy && groupedOptions
    ? Object.values(groupedOptions).flat()
    : filteredOptions;

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current) {
      const highlightedElement = optionsRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < flattenedOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < flattenedOptions.length) {
          onChange(flattenedOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchText('');
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchText('');
        setHighlightedIndex(-1);
        break;
    }
  };

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
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type to search..."
              />
            </div>
          </div>

          <div ref={optionsRef} className="max-h-60 overflow-y-auto">
            {groupBy && groupedOptions ? (
              Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <div key={group} className="border-b border-gray-100 last:border-b-0">
                  <div className="sticky top-0 px-4 py-2 bg-gray-100 text-sm font-semibold text-gray-800 cursor-default select-none">
                    {group}
                  </div>
                  {groupOptions.map((option) => {
                    const flatIndex = flattenedOptions.findIndex(o => o.value === option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        data-index={flatIndex}
                        onClick={() => {
                          onChange(option.value);
                          setIsOpen(false);
                          setSearchText('');
                          setHighlightedIndex(-1);
                        }}
                        onMouseEnter={() => setHighlightedIndex(flatIndex)}
                        className={`
                          w-full px-6 py-2 text-left flex items-center gap-2
                          hover:bg-gray-50 transition-colors text-sm
                          ${value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                          ${highlightedIndex === flatIndex ? 'bg-gray-100' : ''}
                        `}
                      >
                        {option.icon && <span>{option.icon}</span>}
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  data-index={index}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchText('');
                    setHighlightedIndex(-1);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full px-4 py-2 text-left flex items-center gap-2
                    hover:bg-gray-50 transition-colors text-sm
                    ${value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                    ${highlightedIndex === index ? 'bg-gray-100' : ''}
                  `}
                >
                  {option.icon && <span>{option.icon}</span>}
                  <span>{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
