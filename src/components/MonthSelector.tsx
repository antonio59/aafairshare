import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date(selectedMonth + '-01');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    const newDate = subMonths(startOfMonth(currentDate), 1);
    onMonthChange(format(newDate, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const newDate = addMonths(startOfMonth(currentDate), 1);
    onMonthChange(format(newDate, 'yyyy-MM'));
  };

  const handleMonthSelect = (monthOffset: number) => {
    const newDate = new Date(currentDate.getFullYear(), monthOffset);
    onMonthChange(format(newDate, 'yyyy-MM'));
    setIsOpen(false);
  };

  const handleYearChange = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear() + offset, currentDate.getMonth());
    onMonthChange(format(newDate, 'yyyy-MM'));
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm">
        <button
          onClick={handlePrevMonth}
          className="p-4 hover:bg-gray-50 rounded-l-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 px-4 py-3 font-medium text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5 text-gray-500" />
          <span>
            {format(currentDate, 'MMMM yyyy')}
          </span>
        </button>
        
        <button
          onClick={handleNextMonth}
          className="p-4 hover:bg-gray-50 rounded-r-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-2">
            {/* Year selector */}
            <div className="flex items-center justify-between mb-2 px-2 py-1">
              <button
                onClick={() => handleYearChange(-1)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium">{currentDate.getFullYear()}</span>
              <button
                onClick={() => handleYearChange(1)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-3 gap-1">
              {months.map((month, index) => {
                const isCurrentMonth = index === currentDate.getMonth();
                return (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(index)}
                    className={`
                      px-2 py-2 text-sm rounded transition-colors
                      ${isCurrentMonth 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
