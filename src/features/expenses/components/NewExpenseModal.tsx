import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, _Plus, _DollarSign, Calendar, Tag, _MapPin, Users, _Upload, _Search, ChevronUp, ChevronDown, SplitSquareVertical, UserMinus } from 'lucide-react';
import { useCurrency } from '../../../core/contexts/CurrencyContext';
import { createExpense, updateExpense } from '../api/expenseApi';
import { useAuth } from '../../../core/contexts/AuthContext';
import { supabase } from '../../../core/api/supabase';
import { getCurrentISODate } from '../../shared/utils/date-utils';
import { validateExpense, sanitizeAmount } from '../../shared/utils/validation';
import { useCSRF } from '../../shared/utils/csrf';
import LocationCombobox from './LocationCombobox';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: () => void;
  expenseToEdit?: Expense; // Using the Expense type instead of any
}

type Expense = {
  id?: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  location?: string;
  currency: string;
  user_id: string;
  notes?: string;
  split_type?: string;
  categories?: string[];
  locations?: string[];
}

// Helper function to format date to UK format
const _formatToUKDate = (dateString: string): string => {
  try {
    if (!dateString) return 'DD/MM/YYYY';
    const [year, month, day] = dateString.split(/T|-/);
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'DD/MM/YYYY';
  }
};

// Helper function to format date to ISO format
const _formatToISODate = (dateString: string): string => {
  try {
    if (!dateString) return getCurrentISODate();
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return getCurrentISODate();
  }
};

export default function NewExpenseModal({ isOpen, onClose, onExpenseCreated, expenseToEdit }: NewExpenseModalProps) {
  const { user, profile } = useAuth();
  const { currency, formatAmount: _formatAmount, supportedCurrencies } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [_success, setSuccess] = useState(false);
  const [selectedSplitType, setSelectedSplitType] = useState(expenseToEdit?.split_type || 'equal'); // 'equal' or 'none'
  const [categories, setCategories] = useState<Array<{id: string, category: string}>>([]);
  const [locations, setLocations] = useState<Array<{id: string, location: string}>>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const MAX_NOTES_LENGTH = 500;
  
  // Initialize with current date if no date is provided
  const initialDate = useMemo(() => {
    try {
      // If editing and has date, use it
      if (expenseToEdit?.date) {
        const dateStr = expenseToEdit.date;
        // Handle both ISO and non-ISO date formats
        return dateStr.includes('T') 
          ? dateStr.split('T')[0] 
          : dateStr;
      }
      // Default to current date
      return getCurrentISODate();
    } catch (error) {
      console.error('Date initialization error:', error);
      return getCurrentISODate();
    }
  }, [expenseToEdit]);

  const safeExpense = useMemo(() => {
    // Initialize with safe defaults
    const defaultExpense = {
      date: initialDate,
      amount: expenseToEdit?.amount || 0,
      category: '',
      category_id: null,
      notes: expenseToEdit?.notes || '',
      location: '',
      location_id: null,
      paid_by: user?.id || '',
      split_type: expenseToEdit?.split_type || 'equal'
    };
    
    // If we're editing an expense, handle the category and location mapping
    if (expenseToEdit) {
      // Handle category - might be in different formats based on the API response
      if (expenseToEdit.categories && expenseToEdit.categories.category) {
        // From getExpenseDetails format
        defaultExpense.category = expenseToEdit.categories.category;
        defaultExpense.category_id = expenseToEdit.categories.id;
      } else if (expenseToEdit.category) {
        // Legacy or formatted data
        defaultExpense.category = expenseToEdit.category;
      }
      
      // Handle location - might be in different formats based on the API response
      if (expenseToEdit.locations && expenseToEdit.locations.location) {
        // From getExpenseDetails format
        defaultExpense.location = expenseToEdit.locations.location;
        defaultExpense.location_id = expenseToEdit.locations.id;
      } else if (expenseToEdit.location) {
        // Legacy or formatted data
        defaultExpense.location = expenseToEdit.location;
      }
      
      // Handle paid_by
      defaultExpense.paid_by = expenseToEdit.paid_by || user?.id || '';
      
      // Copy over all other properties
      return { ...defaultExpense, ...expenseToEdit };
    }
    
    return defaultExpense;
  }, [expenseToEdit, initialDate, user?.id]);

  const [expenseData, setExpenseData] = useState(safeExpense);

  const _csrf = useCSRF();

  useEffect(() => {
    // Load locations
    const loadLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, location')
          .order('location');
        
        if (error) throw error;
        
        if (data) {
          // Convert to unknown first before type assertion
          setLocations((data as unknown) as Array<{id: string, location: string}>);
        }
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };
    
    // Load categories
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, category')
          .order('category');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Convert to unknown first before type assertion
          setCategories((data as unknown) as Array<{id: string, category: string}>);
          // Set default category if not editing
          if (!expenseToEdit && data.length > 0) {
            const typedData = (data as unknown) as Array<{id: string, category: string}>;
            setExpenseData((prev: any) => ({ 
              ...prev, 
              category: typedData[0].category, 
              category_id: typedData[0].id 
            }));
          }
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadLocations();
    loadCategories();
  }, [expenseToEdit]);

  useEffect(() => {
    // Update currency when it changes in context
    setExpenseData((prev: any) => ({ ...prev, currency }));
  }, [currency]);

  useEffect(() => {
    // Initialize selected locations if editing an expense
    if (expenseToEdit?.all_locations && Array.isArray(expenseToEdit.all_locations)) {
      setSelectedLocations(expenseToEdit.all_locations);
    } else if (expenseToEdit?.location) {
      setSelectedLocations([expenseToEdit.location]);
    }
  }, [expenseToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpenseData((prev: any) => ({ 
      ...prev, 
      [name]: value ?? '' 
    }));
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedAmount = sanitizeAmount(e.target.value);
    setExpenseData((prev: any) => ({ ...prev, amount: sanitizedAmount }));
  };

  // Auto-format amount on blur for better user experience
  const handleAmountBlur = () => {
    if (expenseData.amount) {
      // Format to 2 decimal places if needed
      const formattedAmount = Number(expenseData.amount).toFixed(2);
      setExpenseData((prev: any) => ({ 
        ...prev, 
        amount: formattedAmount === '0.00' ? '' : formattedAmount 
      }));
    }
  };

  const handleLocationChange = (location: string | null) => {
    if (location === null) {
      // Clear all locations
      setSelectedLocations([]);
      setExpenseData((prev: any) => ({ 
        ...prev, 
        location: null 
      }));
    } else if (!selectedLocations.includes(location)) {
      // Add new location
      const newLocations = [...selectedLocations, location];
      setSelectedLocations(newLocations);
      // Set the primary location to the first one for backward compatibility
      setExpenseData((prev: any) => ({ 
        ...prev, 
        location: newLocations[0] 
      }));
    } else {
      // Remove existing location
      const newLocations = selectedLocations.filter(loc => loc !== location);
      setSelectedLocations(newLocations);
      // Update primary location or set to null if empty
      setExpenseData((prev: any) => ({ 
        ...prev, 
        location: newLocations.length > 0 ? newLocations[0] : null 
      }));
    }
  };

  const handleCreateNewLocation = async (locationName: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({ location: locationName })
        .select('id, location')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setLocations(prev => [...prev, data as unknown as {id: string, location: string}]);
        setExpenseData((prev: any) => ({ 
          ...prev, 
          location: locationName 
        }));
      }
    } catch (error) {
      console.error('Error creating new location:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting expense update/creation');
    setLoading(true);
    setError('');
    setValidationErrors({});

    try {
      // Find the category ID for the selected category name
      let categoryId = null;
      if (expenseData.category) {
        const categoryObj = categories.find(c => c.category === expenseData.category);
        if (categoryObj) {
          categoryId = categoryObj.id;
        }
      }

      // Find the location ID for the selected location name
      let locationId = null;
      if (expenseData.location) {
        const locationObj = locations.find(l => l.location === expenseData.location);
        if (locationObj) {
          locationId = locationObj.id;
        }
      }

      // Create formatted expense data with required fields for ExpenseCreate
      const formattedExpenseData: any = {
        amount: parseFloat(expenseData.amount),
        date: expenseData.date,
        category_id: categoryId,
        notes: expenseData.notes || '',
        location_id: locationId,
        // Add support for multiple locations
        locations: selectedLocations,
        paid_by: user.id,
        split_type: selectedSplitType
      };

      // Validate the expense data
      const validation = validateExpense(formattedExpenseData);
      if (!validation.success) {
        setValidationErrors(
          validation.errors.reduce((acc, err) => ({
            ...acc,
            [err.field]: err.message
          }), {})
        );
        throw new Error('Validation failed');
      }

      console.log('Submitting expense data:', formattedExpenseData);

      let result;
      try {
        if (expenseToEdit) {
          // updateExpense only takes the expense ID and data, no headers
          result = await updateExpense(expenseToEdit.id, formattedExpenseData);
          // updateExpense returns a boolean
          console.log('Received result from updateExpense:', result);
        } else {
          result = await createExpense(formattedExpenseData);
          // createExpense returns the created expense or null
          console.log('Received result from createExpense:', result);
        }
      } catch (err) {
        const apiError = err as Error;
        console.error('API call failed:', apiError);
        throw new Error(`Failed to ${expenseToEdit ? 'update' : 'create'} expense: ${apiError.message}`);
      }
      
      // Check if the operation was successful
      const isSuccess = expenseToEdit ? (result === true) : (result !== null);
      
      if (isSuccess) {
        setSuccess(true);
        // Trigger refresh immediately
        if (onExpenseCreated) {
          onExpenseCreated();
        }
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(`Failed to ${expenseToEdit ? 'update' : 'create'} expense: No success response received`);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error creating/updating expense:', error);
      // Provide more specific error message
      let errorMessage = error.message || `Failed to ${expenseToEdit ? 'update' : 'create'} expense. Please try again.`;
      
      // Check for database-specific errors
      if ((error as any).code === 'PGRST204') {
        errorMessage = 'Database schema error: The category or location fields may have changed. Please check your data format.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('Form submission completed');
    }
  };

  const _getCurrencySymbol = () => {
    return supportedCurrencies[currency]?.symbol || '$';
  };

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm.trim()) return categories;
    return categories.filter(cat => 
      cat.category.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  }, [categories, categorySearchTerm]);

  // Close category dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategorySelect = (category: string) => {
    setExpenseData((prev: any) => ({ ...prev, category }));
    setShowCategoryDropdown(false);
    setCategorySearchTerm('');
  };
  
  // Get commonly used categories (up to 4)
  const commonCategories = useMemo(() => {
    return categories.slice(0, 4);
  }, [categories]);

  // Handle notes change with character limit
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_NOTES_LENGTH) {
      setExpenseData((prev: any) => ({ 
        ...prev, 
        notes: value 
      }));
    }
  };
  
  // Calculate remaining characters for notes
  const notesRemainingChars = MAX_NOTES_LENGTH - (expenseData.notes?.length || 0);
  const isNotesLimitNear = notesRemainingChars < 50;

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  // Helper function to get yesterday's date in YYYY-MM-DD format
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };
  
  // Helper function to set date to a specific day
  const setDateToDay = (dateString: string) => {
    setExpenseData((prev: any) => ({ ...prev, date: dateString }));
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? '' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Two-column layout for small fields on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Amount field */}
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
                      value={expenseData.amount}
                      onChange={handleAmountChange}
                      onBlur={handleAmountBlur}
                      className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
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

                {/* Date field */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    When did you pay?
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={expenseData.date}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      required
                    />
                  </div>
                  
                  {/* Quick date selection buttons */}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setDateToDay(getTodayDate())}
                      className={`px-3 py-1 text-xs rounded-full ${
                        expenseData.date === getTodayDate() 
                          ? 'bg-rose-100 text-rose-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateToDay(getYesterdayDate())}
                      className={`px-3 py-1 text-xs rounded-full ${
                        expenseData.date === getYesterdayDate() 
                          ? 'bg-rose-100 text-rose-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Yesterday
                    </button>
                  </div>
                </div>
              </div>

              {/* Category field - full width */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                
                {/* Quick category buttons */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`px-3 py-1 text-sm rounded-lg ${
                        expenseData.category === category.category
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleCategorySelect(category.category)}
                    >
                      {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                    </button>
                  ))}
                </div>
                
                {/* Searchable dropdown */}
                <div className="relative" ref={categoryDropdownRef}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Tag size={16} className="text-gray-400" />
                    </div>
                    <input
                      ref={categoryInputRef}
                      type="text"
                      id="categorySearch"
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      onFocus={() => setShowCategoryDropdown(true)}
                      placeholder="Search or select a category"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                        validationErrors.category_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      >
                        {showCategoryDropdown ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Dropdown menu */}
                  {showCategoryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-1">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
                                expenseData.category === category.category
                                  ? 'bg-rose-100 text-rose-600'
                                  : 'hover:bg-gray-100'
                              }`}
                              onClick={() => handleCategorySelect(category.category)}
                            >
                              {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">No categories found</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {validationErrors.category_id && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.category_id}</p>
                  )}
                </div>
                
                {/* Display selected category if any */}
                {expenseData.category && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selected: <span className="font-medium">{expenseData.category}</span>
                  </p>
                )}
              </div>

              {/* Location field - full width */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Where was this expense?
                </label>
                <LocationCombobox
                  locations={locations}
                  value={null}
                  onChange={handleLocationChange}
                  allowMultiple={true}
                  selectedValues={selectedLocations}
                  onCreateNew={handleCreateNewLocation}
                  placeholder="Search or create locations..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Select multiple locations or create new ones. Press Enter to add.
                </p>
              </div>

              {/* Notes field - full width */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <div className="relative">
                  <textarea
                    id="notes"
                    name="notes"
                    value={expenseData.notes ?? ''}
                    onChange={handleNotesChange}
                    placeholder="Add any additional details about this expense"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                      isNotesLimitNear ? 'border-amber-300' : 'border-gray-300'
                    }`}
                    rows={3}
                  />
                  <div className={`absolute bottom-2 right-2 text-xs ${
                    isNotesLimitNear ? 'text-amber-500' : 'text-gray-400'
                  }`}>
                    {expenseData.notes?.length || 0}/{MAX_NOTES_LENGTH}
                  </div>
                </div>
                {isNotesLimitNear && (
                  <p className="mt-1 text-xs text-amber-500">
                    {notesRemainingChars === 0 
                      ? 'Maximum character limit reached' 
                      : `${notesRemainingChars} characters remaining`}
                  </p>
                )}
              </div>

              {/* Two-column layout for split settings on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Who paid field */}
                <div>
                  <label htmlFor="paid_by" className="block text-sm font-medium text-gray-700 mb-1">
                    Who paid?
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Users size={16} className="text-gray-400" />
                    </div>
                    <select
                      id="paid_by"
                      name="paid_by"
                      value={expenseData.paid_by ?? ''}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      {/* Display the payer from expense data if available */}
                      {expenseToEdit && expenseToEdit.user_info ? (
                        <option value={expenseData.paid_by}>
                          {expenseToEdit.user_info.name || expenseToEdit.user_info.email || 'Unknown'}
                        </option>
                      ) : (
                        <option value={user?.id}>{profile?.name || user?.email}</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Split type field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Split type
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className={`flex items-center flex-1 p-2 border rounded-lg transition-colors ${
                        selectedSplitType === 'equal' 
                          ? 'border-rose-500 bg-rose-50 text-rose-600' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSplitType('equal')}
                    >
                      <SplitSquareVertical size={18} className={`mr-2 ${selectedSplitType === 'equal' ? 'text-rose-500' : 'text-gray-400'}`} />
                      <span className="text-sm">Equal Split</span>
                    </button>
                    
                    <button
                      type="button"
                      className={`flex items-center flex-1 p-2 border rounded-lg transition-colors ${
                        selectedSplitType === 'none' 
                          ? 'border-rose-500 bg-rose-50 text-rose-600' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSplitType('none')}
                    >
                      <UserMinus size={18} className={`mr-2 ${selectedSplitType === 'none' ? 'text-rose-500' : 'text-gray-400'}`} />
                      <span className="text-sm">No Split</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Error display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Form buttons */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
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