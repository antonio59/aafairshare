'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface Category {
  id: string;
  category: string;
}

export interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategoryDropdown({ value, onChange }: CategoryDropdownProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [topCategories, setTopCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setTopCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);

    // Filter suggestions based on input
    const filtered = topCategories.filter(cat =>
      cat.category.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSelectCategory = (category: Category) => {
    setSearchTerm(category.category);
    onChange(category.id);
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
        placeholder="Search category"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-48 overflow-auto">
          {suggestions.map((category) => (
            <li
              key={category.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectCategory(category)}
            >
              {category.category}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}