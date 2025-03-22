'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import LocationDropdown from './LocationDropdown';

export interface Category {
  id: string;
  category: string;
}

export interface Location {
  id: string;
  location: string;
}

import type { Expense as BaseExpense } from '@/types/expenses';

export interface Expense extends BaseExpense {
  category?: Category;
  location?: Location;
}

export interface ExpenseDetailsProps {
  expense: Expense;
  onUpdate: () => void;
}

export default function ExpenseDetails({ expense, onUpdate }: ExpenseDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Expense>({ ...expense, notes: expense.notes || '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, category');
      if (categoriesData) setCategories(categoriesData);
    };
    fetchCategories();
  }, [supabase]);

  useEffect(() => {
    const fetchCategoryAndLocation = async () => {
      if (expense.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id, category')
          .eq('id', expense.category_id)
          .single();
        if (categoryData) setCategory(categoryData);
      }

      if (expense.location_id) {
        const { data: locationData } = await supabase
          .from('locations')
          .select('id, location')
          .eq('id', expense.location_id)
          .single();
        if (locationData) setLocation(locationData);
      }
    };

    fetchCategoryAndLocation();
  }, [expense.category_id, expense.location_id, supabase]);

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('expenses')
      .update({
        amount: formData.amount,
        category_id: formData.category_id,
        location_id: formData.location_id,
        notes: formData.notes,
        date: formData.date,
        split_type: formData.split_type,
      })
      .eq('id', expense.id);

    if (error) {
      console.error('Error updating expense:', error);
      return;
    }

    setIsEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expense.id);

    if (error) {
      console.error('Error deleting expense:', error);
      return;
    }

    onUpdate();
  };

  if (isEditing) {
    return (
      <div className={cn("bg-white p-4 rounded-lg shadow mb-4")}>
        <div className={cn("space-y-4")}>
          <div>
            <label className={cn("block text-sm font-medium text-gray-700")}>Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className={cn(
                "mt-1 block w-full rounded-md",
                "border-gray-300 shadow-sm",
                "focus:border-indigo-500 focus:ring-indigo-500",
                "sm:text-sm"
              )}
            />
          </div>
          <div>
            <label className={cn("block text-sm font-medium text-gray-700")}>Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className={cn(
                "mt-1 block w-full rounded-md",
                "border-gray-300 shadow-sm",
                "focus:border-indigo-500 focus:ring-indigo-500",
                "sm:text-sm"
              )}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={cn("block text-sm font-medium text-gray-700")}>Location</label>
            <LocationDropdown
              value={location?.location || ''}
              onChange={(locationId) => setFormData({ ...formData, location_id: locationId })}
            />
          </div>
          <div>
            <label className={cn("block text-sm font-medium text-gray-700")}>Description (Optional)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={cn(
                "mt-1 block w-full rounded-md",
                "border-gray-300 shadow-sm",
                "focus:border-indigo-500 focus:ring-indigo-500",
                "sm:text-sm"
              )}
            />
          </div>
          <div>
            <label className={cn("block text-sm font-medium text-gray-700")}>Date</label>
            <input
              type="date"
              value={formData.date.split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={cn(
                "mt-1 block w-full rounded-md",
                "border-gray-300 shadow-sm",
                "focus:border-indigo-500 focus:ring-indigo-500",
                "sm:text-sm"
              )}
            />
          </div>
          <div>
            <label className={cn("block text-sm font-medium text-gray-700")}>Split Type</label>
            <select
              value={formData.split_type}
              onChange={(e) => setFormData({ ...formData, split_type: e.target.value as 'Equal' | 'No Split' })}
              className={cn(
                "mt-1 block w-full rounded-md",
                "border-gray-300 shadow-sm",
                "focus:border-indigo-500 focus:ring-indigo-500",
                "sm:text-sm"
              )}
            >
              <option value="Equal">Equal Split</option>
              <option value="No Split">No Split</option>
            </select>
          </div>
          <div className={cn("flex justify-end space-x-2")}>
            <button
              onClick={() => setIsEditing(false)}
              className={cn(
                "px-4 py-2 text-sm font-medium",
                "text-gray-700 bg-white border border-gray-300 rounded-md",
                "hover:bg-gray-50"
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className={cn(
                "px-4 py-2 text-sm font-medium",
                "text-white bg-indigo-600 border border-transparent rounded-md",
                "hover:bg-indigo-700"
              )}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white p-3 rounded-lg shadow mb-3")}>
      <div className={cn("flex justify-between items-start")}>
        <div className={cn("space-y-1")}>
          <div className={cn("flex items-baseline gap-4")}>
            <div>
              <span className={cn("text-[10px] text-gray-400 block leading-none mb-0.5")}>Amount</span>
              <p className={cn("text-lg font-semibold leading-none")}>£{expense.amount.toFixed(2)}</p>
            </div>
            <div>
              <span className={cn("text-[10px] text-gray-400 block leading-none mb-0.5")}>Date</span>
              <p className={cn("text-xs text-gray-500 leading-none")}>{new Date(expense.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className={cn("flex flex-wrap gap-1 mb-2")}>
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5",
              "rounded-full text-xs font-medium",
              "bg-blue-100 text-blue-800"
            )}>
              <span className={cn("text-blue-600")}>Category:</span>
              {category?.category || 'Loading...'}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5",
              "rounded-full text-xs font-medium",
              "bg-green-100 text-green-800"
            )}>
              <span className={cn("text-green-600")}>Location:</span>
              {location?.location || 'Loading...'}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5",
              "rounded-full text-xs font-medium",
              "bg-gray-100 text-gray-800"
            )}>
              <span className={cn("text-gray-600")}>Split:</span>
              {expense.split_type}
            </span>
          </div>
          <div className={cn("text-xs")}>
            <span className={cn("text-gray-500")}>Paid by: {expense.users.name}</span>
            {expense.notes && <span className={cn("text-gray-600 italic ml-2")}>{expense.notes}</span>}
          </div>
        </div>
        <div className={cn("flex space-x-2")}>
          <button
            onClick={() => setIsEditing(true)}
            className={cn(
              "p-2 rounded-md transition-colors",
              "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
          <button
            onClick={() => setIsDeleting(true)}
            className={cn(
              "p-2 rounded-md transition-colors",
              "text-red-600 hover:text-red-800 hover:bg-red-50"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      {isDeleting && (
        <div className={cn("mt-4 p-4 bg-red-50 rounded-md")}>
          <p className={cn("text-sm text-red-600 mb-2")}>Are you sure you want to delete this expense?</p>
          <div className={cn("flex justify-end space-x-2")}>
            <button
              onClick={() => setIsDeleting(false)}
              className={cn(
                "px-3 py-1 text-sm",
                "text-gray-600 hover:text-gray-800"
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className={cn(
                "px-3 py-1 text-sm rounded",
                "text-white bg-red-600 hover:bg-red-700"
              )}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}