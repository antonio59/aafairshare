import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const handlePrevMonth = () => {
    // Create a new date object to avoid mutating the original
    const currentDate = new Date(selectedMonth + '-01');
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    onMonthChange(newDate.toISOString().substring(0, 7));
  };

  const handleNextMonth = () => {
    // Create a new date object to avoid mutating the original
    const currentDate = new Date(selectedMonth + '-01');
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    onMonthChange(newDate.toISOString().substring(0, 7));
  };

  // Create a new date object for display
  const displayDate = new Date(selectedMonth + '-01');

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-6">
      <button
        onClick={handlePrevMonth}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <h2 className="text-lg font-semibold">
        {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      
      <button
        onClick={handleNextMonth}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
