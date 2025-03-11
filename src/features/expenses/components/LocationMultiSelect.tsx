import React, { useState, useEffect } from 'react';
import LocationCombobox from './LocationCombobox';

interface Location {
  id: string;
  location: string;
}

interface LocationMultiSelectProps {
  locations: Location[];
  values: string[];
  onChange: (values: string[]) => void;
  onCreateNew?: (value: string) => Promise<void>;
  placeholder?: string;
}

export default function LocationMultiSelect({
  locations,
  values = [],
  onChange,
  onCreateNew,
  placeholder = 'Search locations...'
}: LocationMultiSelectProps) {
  const [selectedLocations, setSelectedLocations] = useState<string[]>(values);

  // Sync with parent component values
  useEffect(() => {
    setSelectedLocations(values);
  }, [values]);

  const handleLocationChange = (location: string | null) => {
    if (!location) {
      // If location is cleared, reset the selection
      setSelectedLocations([]);
      onChange([]);
    } else if (!selectedLocations.includes(location)) {
      // Add to the selection if not already included
      const newSelection = [...selectedLocations, location];
      setSelectedLocations(newSelection);
      onChange(newSelection);
    } else {
      // Remove from selection if already selected
      const newSelection = selectedLocations.filter(loc => loc !== location);
      setSelectedLocations(newSelection);
      onChange(newSelection);
    }
  };

  return (
    <LocationCombobox
      locations={locations}
      value={null} // Always null since we're handling multiple values
      onChange={handleLocationChange}
      allowMultiple={true}
      onCreateNew={onCreateNew}
      placeholder={placeholder}
    />
  );
} 