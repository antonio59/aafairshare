'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface Location {
  id: string;
  location: string;
}

export interface LocationDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LocationDropdown({ value, onChange }: LocationDropdownProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [topLocations, setTopLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setTopLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);

    // Filter suggestions based on input
    const filtered = topLocations.filter(loc =>
      loc.location.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSelectLocation = (location: Location) => {
    setSearchTerm(location.location);
    onChange(location.id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className="w-full p-2 border rounded-md"
        placeholder="Search location"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-48 overflow-auto">
          {suggestions.map((location) => (
            <li
              key={location.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectLocation(location)}
            >
              {location.location}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}