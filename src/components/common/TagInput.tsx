import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useClickOutside } from '../../utils/useClickOutside';

interface Tag {
  id: string;
  name: string;
}

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  onCreateTag: (name: string) => Promise<void>;
  availableTags: Tag[];
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export default function TagInput({
  value,
  onChange,
  onCreateTag,
  availableTags,
  label,
  required,
  placeholder = 'Add tags...'
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), [inputRef]);

  const selectedTags = value.map(id => availableTags.find(tag => tag.id === id)).filter(Boolean) as Tag[];
  const filteredTags = availableTags.filter(tag => 
    !value.includes(tag.id) &&
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      if (filteredTags.length > 0) {
        // Select first filtered tag
        onChange([...value, filteredTags[0].id]);
      } else {
        // Create new tag
        setIsCreating(true);
        try {
          await onCreateTag(inputValue);
          const newTag = availableTags.find(tag => tag.name === inputValue);
          if (newTag) {
            onChange([...value, newTag.id]);
          }
        } finally {
          setIsCreating(false);
        }
      }
      setInputValue('');
      setIsOpen(false);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag when backspace is pressed and input is empty
      onChange(value.slice(0, -1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen && e.target.value) {
      setIsOpen(true);
    }
  };

  const removeTag = (tagId: string) => {
    onChange(value.filter(id => id !== tagId));
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`
          min-h-[42px] px-2 py-1 border rounded-lg bg-white
          focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent
          ${isOpen ? 'border-blue-500' : 'border-gray-300'}
        `}
      >
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setIsOpen(true)}
            className="flex-1 min-w-[120px] outline-none py-1 bg-transparent"
            placeholder={selectedTags.length === 0 ? placeholder : ''}
            disabled={isCreating}
          />
        </div>
      </div>

      {isOpen && filteredTags.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                onChange([...value, tag.id]);
                setInputValue('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {isOpen && inputValue && filteredTags.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        >
          <p className="text-sm text-gray-600">
            Press Enter to create "{inputValue}"
          </p>
        </div>
      )}
    </div>
  );
}
