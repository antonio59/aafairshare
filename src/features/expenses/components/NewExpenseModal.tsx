import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { X, Calendar, Tag, Users, ChevronUp, ChevronDown, SplitSquareVertical, UserMinus } from 'lucide-react';
import { createExpense, updateExpense } from '../api/expenseApi';
import { useAuth } from '../../../core/contexts/AuthContext';
import { supabase } from '../../../core/api/supabase';
import { getCurrentISODate } from '../../shared/utils/date-utils';
import { validateExpenseCreate, sanitizeAmount } from '../../../core/utils/validation';
import { useCSRF } from '../../shared/utils/csrf';
import { Expense, ExpenseCreate } from '../../../core/types/expenses';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: () => void;
  expenseToEdit?: Expense;
}

interface ExpenseFormData {
  date?: string;
  amount: number;
  category?: string;
  category_id: string | null;
  notes?: string | null;
  location?: string;
  location_id: string | null;
  paid_by: string | null;
  split_type: 'equal' | 'none' | string;
}

interface CategoryEntity {
  id: string;
  category: string;
}

interface LocationEntity {
  id: string;
  location: string;
}

export default function NewExpenseModal({
  isOpen,
  onClose,
  onExpenseCreated,
  expenseToEdit
}: NewExpenseModalProps) {
  const { user } = useAuth();
  const currency = "GBP";
  const csrf = useCSRF();
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedSplitType, setSelectedSplitType] = useState<'equal' | 'none' | string>(expenseToEdit?.split_type === 'none' ? 'none' : 'equal');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Data state
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [locations, setLocations] = useState<LocationEntity[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  // UI interaction state
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // References
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Constants
  const MAX_NOTES_LENGTH = 500;
  
  const initialDate = useMemo(() => {
    try {
      if (expenseToEdit?.date) {
        const dateStr = expenseToEdit.date;
        return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      }
      return getCurrentISODate();
    } catch (error) {
      console.error('Date initialization error:', error);
      return getCurrentISODate();
    }
  }, [expenseToEdit]);

  const safeExpense = useMemo(() => {
    const defaultExpense: ExpenseFormData = {
      date: initialDate,
      amount: expenseToEdit?.amount || 0,
      category: '',
      category_id: null,
      notes: expenseToEdit?.notes || '',
      location: '',
      location_id: null,
      paid_by: user?.id || '',
      split_type: expenseToEdit?.split_type === 'none' ? 'none' : 'equal'
    };
    
    if (expenseToEdit) {
      if (expenseToEdit._category) {
        defaultExpense.category = expenseToEdit._category;
        defaultExpense.category_id = expenseToEdit.category_id;
      } else if (expenseToEdit._category) {
        defaultExpense.category = expenseToEdit._category;
      }
      
      if (expenseToEdit._location) {
        defaultExpense.location = expenseToEdit._location;
        defaultExpense.location_id = expenseToEdit.location_id;
      } else if (expenseToEdit._location) {
        defaultExpense.location = expenseToEdit._location;
      }
      
      defaultExpense.paid_by = expenseToEdit.paid_by || user?.id || '';
      
      return { ...defaultExpense, ...expenseToEdit };
    }
    
    return defaultExpense;
  }, [expenseToEdit, initialDate, user?.id]);

  const [expenseData, setExpenseData] = useState<ExpenseFormData>(safeExpense);

  const loadReferenceData = useCallback(async () => {
    try {
      const [locationResult, categoryResult] = await Promise.all([
        supabase.from('locations').select('id, location').order('location'),
        supabase.from('categories').select('id, category').order('category')
      ]);

      if (locationResult.error) throw locationResult.error;
      if (categoryResult.error) throw categoryResult.error;

      if (locationResult.data) {
        setLocations(locationResult.data as LocationEntity[]);
      }

      if (categoryResult.data?.length) {
        setCategories(categoryResult.data as CategoryEntity[]);
        if (!expenseToEdit && categoryResult.data.length > 0) {
          setExpenseData(prev => ({
            ...prev,
            category: categoryResult.data[0].category,
            category_id: categoryResult.data[0].id
          }));
        }
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
      setError('Failed to load categories and locations. Please try again.');
    }
  }, [expenseToEdit]);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    setExpenseData(prev => ({ ...prev, currency }));
  }, [currency]);

  useEffect(() => {
    if (expenseToEdit?._all_locations && Array.isArray(expenseToEdit._all_locations)) {
      setSelectedLocations(expenseToEdit._all_locations);
    } else if (expenseToEdit?._location) {
      setSelectedLocations([expenseToEdit._location]);
    }
  }, [expenseToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpenseData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedAmount = sanitizeAmount(e.target.value);
    setExpenseData(prev => ({ ...prev, amount: sanitizedAmount ?? 0 }));
    
    if (validationErrors.amount) {
      setValidationErrors(prev => {
        const { amount: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleAmountBlur = () => {
    if (expenseData.amount) {
      const formattedAmount = Number(expenseData.amount).toFixed(2);
      setExpenseData(prev => ({
        ...prev,
        amount: formattedAmount === '0.00' ? 0 : parseFloat(formattedAmount)
      }));
    }
  };

  const handleLocationSelect = (locationObj: LocationEntity | { id: string | null; location: string }) => {
    setExpenseData(prev => ({
      ...prev,
      location: locationObj.location,
      location_id: locationObj.id
    }));
    
    if (validationErrors.location_id) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated.location_id;
        return updated;
      });
    }
  };

  const filteredLocations = useMemo(() => {
    return locations;
  }, [locations]);

  const handleRemoveLocation = (location: string) => {
    const updatedLocations = selectedLocations.filter(loc => loc !== location);
    setSelectedLocations(updatedLocations);
    
    if (expenseData.location === location) {
      if (updatedLocations.length > 0) {
        const newPrimaryLocation = updatedLocations[0];
        const locationObj = locations.find(l => l.location === newPrimaryLocation);
        
        setExpenseData(prev => ({
          ...prev,
          location: newPrimaryLocation,
          location_id: locationObj?.id || null
        }));
      } else {
        setExpenseData(prev => ({ ...prev, location: undefined, location_id: null }));
      }
    }
  };

  const handleToggleCategoryDropdown = () => {
    setShowCategoryDropdown(prev => !prev);
    if (!showCategoryDropdown && categoryInputRef.current) {
      setTimeout(() => categoryInputRef.current?.focus(), 0);
    }
  };

  const handleCategorySelect = (categoryObj: CategoryEntity) => {
    setExpenseData(prev => ({
      ...prev,
      category: categoryObj.category,
      category_id: categoryObj.id
    }));
    setShowCategoryDropdown(false);
    setCategorySearchTerm('');
    
    if (validationErrors.category_id) {
      setValidationErrors(prev => {
        const { category_id: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm.trim()) return categories;
    return categories.filter(cat =>
      cat.category.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  }, [categories, categorySearchTerm]);

  const handleToggleSplitType = (splitType: 'equal' | 'none') => {
    setSelectedSplitType(splitType);
    setExpenseData(prev => ({ ...prev, split_type: splitType }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});
    setSuccess(false);

    try {
      let categoryId = expenseData.category_id;
      if (expenseData.category && !categoryId) {
        const categoryObj = categories.find(c => c.category === expenseData.category);
        categoryId = categoryObj?.id || null;
      }

      let locationId = expenseData.location_id;
      if (expenseData.location && !locationId) {
        const locationObj = locations.find(l => l.location === expenseData.location);
        locationId = locationObj?.id || null;
      }

      const formattedExpenseData: ExpenseCreate = {
        amount: typeof expenseData.amount === 'string'
          ? parseFloat(expenseData.amount)
          : (expenseData.amount || 0),
        date: expenseData.date || getCurrentISODate(),
        category_id: categoryId,
        notes: expenseData.notes || '',
        location_id: locationId,
        locations: selectedLocations,
        paid_by: expenseData.paid_by || user?.id || '',
        split_type: selectedSplitType
      };

      const validation = validateExpenseCreate(formattedExpenseData);
      if (!validation.valid) {
        setValidationErrors(validation.errors || {});
        throw new Error('Validation failed');
      }

      const csrfToken = await csrf.getToken();
      const result = expenseToEdit?.id
        ? await updateExpense(expenseToEdit.id, formattedExpenseData, csrfToken)
        : await createExpense(formattedExpenseData, csrfToken);

      if (result.success) {
        setSuccess(true);
        
        if (!expenseToEdit) {
          setExpenseData({
            date: getCurrentISODate(),
            amount: 0,
            category: categories[0]?.category || '',
            category_id: categories[0]?.id || null,
            notes: '',
            location: '',
            location_id: null,
            paid_by: user?.id || '',
            split_type: 'equal'
          });
          setSelectedLocations([]);
          formRef.current?.reset();
        }
        
        onExpenseCreated();
        setTimeout(() => onClose(), 1000);
      } else {
        throw new Error(result.message || 'Failed to save expense');
      }
    } catch (err: any) {
      console.error('Error saving expense:', err);
      setError(
        err.message === 'Validation failed'
          ? 'Please fix the validation errors'
          : err.message || 'Failed to save expense. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? '' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md mb-4 text-sm">
                Expense saved successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} ref={formRef} className="space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    How much did you pay?
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500">{currency}</span>
                    </div>
                    <input
                      type="text"
                      id="amount"
                      name="amount"
                      value={expenseData.amount || ''}
                      onChange={handleAmountChange}
                      onBlur={handleAmountBlur}
                      className={`w-full pl-10 pr-3 py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      inputMode="decimal"
                      required
                    />
                    {validationErrors.amount && (
                      <p className="mt-1 text-xs text-red-500">{validationErrors.amount}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    When was this expense?
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={expenseData.date || ''}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.date && (
                      <p className="mt-1 text-xs text-red-500">{validationErrors.date}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative">
                  <div
                    className="relative flex items-center cursor-pointer"
                    onClick={handleToggleCategoryDropdown}
                  >
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Tag size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      ref={categoryInputRef}
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.category_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Search categories..."
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {showCategoryDropdown ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {showCategoryDropdown && (
                    <div
                      ref={categoryDropdownRef}
                      className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                    >
                      {filteredCategories.map((category) => (
                        <div
                          key={category.id}
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category.category}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {validationErrors.category_id && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.category_id}</p>
                )}
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <select
                    className={`w-full pl-3 pr-10 py-2 text-sm md:text-base border rounded-lg ${validationErrors.location_id ? 'border-red-500' : 'border-gray-300'}`}
                    value={expenseData.location || ''}
                    onChange={(e) => handleLocationSelect(locations.find(l => l.location === e.target.value) || { id: null, location: e.target.value })}
                  >
                    <option value="">Select a location</option>
                    {filteredLocations.map((location) => (
                      <option key={location.id} value={location.location}>
                        {location.location}
                      </option>
                    ))}
                  </select>
                  {validationErrors.location_id && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.location_id}</p>
                  )}
                </div>
              </div>



              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={expenseData.notes || ''}
                  onChange={handleChange}
                  maxLength={MAX_NOTES_LENGTH}
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Add any additional details..."
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Split Type
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleToggleSplitType('equal')}
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      selectedSplitType === 'equal'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <SplitSquareVertical size={16} className="mr-2" />
                    Equal Split (50/50)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSplitType('none')}
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      selectedSplitType === 'no_split'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <UserMinus size={16} className="mr-2" />
                    No Split (100%)
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Saving...' : expenseToEdit ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
