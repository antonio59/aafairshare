import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface Location {
  id: string;
  location: string;
}

interface LocationComboboxProps {
  locations: Location[];
  value: string | null;
  onChange: (value: string | null) => void;
  allowMultiple?: boolean;
  selectedValues?: string[]; // For multi-select mode
  onCreateNew?: (value: string) => Promise<void>;
  placeholder?: string;
}

export default function LocationCombobox({
  locations,
  value,
  onChange,
  allowMultiple = false,
  selectedValues = [],
  onCreateNew,
  placeholder = 'Search locations...'
}: LocationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [internalSelectedValues, setInternalSelectedValues] = useState<string[]>(
    allowMultiple ? selectedValues : (value ? [value] : [])
  );
  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter locations based on search query
  const filteredLocations = locations.filter(loc => 
    loc.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keep internal state in sync with props
  useEffect(() => {
    if (allowMultiple) {
      setInternalSelectedValues(selectedValues);
    } else if (value === null) {
      setInternalSelectedValues([]);
    } else {
      setInternalSelectedValues(value ? [value] : []);
    }
  }, [value, selectedValues, allowMultiple]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle selection
  const handleSelect = (locationName: string) => {
    if (allowMultiple) {
      // Toggle selection
      const isSelected = internalSelectedValues.includes(locationName);
      if (isSelected) {
        setInternalSelectedValues(prev => prev.filter(v => v !== locationName));
      } else {
        setInternalSelectedValues(prev => [...prev, locationName]);
      }
      
      // Notify parent component
      onChange(locationName);
    } else {
      // Single select mode
      setInternalSelectedValues([locationName]);
      onChange(locationName);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Clear all selections
  const handleClear = () => {
    setInternalSelectedValues([]);
    onChange(null);
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Remove a single selection (for multi-select)
  const handleRemoveSelection = (location: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the dropdown from opening
    setInternalSelectedValues(prev => prev.filter(v => v !== location));
    // If we're removing the only selection, set value to null
    if (internalSelectedValues.length === 1 && internalSelectedValues[0] === location) {
      onChange(null);
    } else {
      onChange(internalSelectedValues.filter(v => v !== location)[0] || null);
    }
  };

  // Handle creating a new location
  const handleCreateNew = () => {
    if (onCreateNew && searchQuery.trim()) {
      onCreateNew(searchQuery.trim()).then(() => {
        setSearchQuery('');
      });
    }
  };

  // Close dropdown and update parent for multi-select
  const _handleCloseDropdown = () => {
    setIsOpen(false);
    if (allowMultiple && internalSelectedValues.length > 0) {
      onChange(internalSelectedValues[0]); // For now, we just pass the first selected value
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() && !filteredLocations.some(l => l.location === searchQuery)) {
      // Create new location if Enter is pressed and it doesn't exist
      handleCreateNew();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true);
      e.preventDefault();
    }
  };

  return (
    <div className="relative w-full" ref={comboboxRef}>
      <div 
        className={`flex flex-wrap items-center gap-1 p-2 border rounded-lg ${
          isOpen ? 'ring-2 ring-rose-500 border-rose-500' : 'border-gray-300'
        } cursor-text bg-white`}
        onClick={() => {
          setIsOpen(true);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        {/* Selected values as pills */}
        {internalSelectedValues.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            {internalSelectedValues.map(location => (
              <div
                key={location}
                className="flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-800 rounded-full text-sm"
              >
                {location}
                <button
                  type="button"
                  onClick={(e) => handleRemoveSelection(location, e)}
                  className="text-rose-600 hover:text-rose-800"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="relative flex-1 min-w-[100px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full py-1 pl-8 pr-8 text-sm bg-transparent focus:outline-none"
            placeholder={internalSelectedValues.length > 0 ? '' : placeholder}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Clear button - only shown when there are selections */}
        {internalSelectedValues.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-1">
            {/* None option always shown */}
            <button
              type="button"
              className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md ${
                !internalSelectedValues.length ? 'bg-rose-100 text-rose-800' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                handleClear();
                setIsOpen(false);
              }}
            >
              <span>None</span>
              {!internalSelectedValues.length && <Check size={16} className="text-rose-600" />}
            </button>

            {/* Filtered locations */}
            {filteredLocations.length > 0 ? (
              filteredLocations.map(loc => (
                <button
                  key={loc.id}
                  type="button"
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md ${
                    internalSelectedValues.includes(loc.location) ? 'bg-rose-100 text-rose-800' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelect(loc.location)}
                >
                  <span>{loc.location}</span>
                  {internalSelectedValues.includes(loc.location) && <Check size={16} className="text-rose-600" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No locations found</div>
            )}

            {/* Create new option */}
            {searchQuery.trim() && !filteredLocations.some(l => l.location.toLowerCase() === searchQuery.toLowerCase()) && (
              <button
                type="button"
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                onClick={handleCreateNew}
              >
                <span>Create "{searchQuery}&quot;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 