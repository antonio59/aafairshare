import React, { useState, useEffect, _useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { _getExpense, deleteExpense, getExpenseDetails } from '../api/expenseApi';
import NewExpenseModal from './NewExpenseModal';
import { Edit, ArrowLeft, Trash, AlertTriangle, Info } from 'lucide-react';
import { useCurrency } from '../../../core/contexts/CurrencyContext';
import { useSettlementGuard } from '../../settlements/hooks/useSettlementGuard';
import { ErrorBoundary } from '../../shared/components';

interface ExpenseDetailPageProps {
  isEditMode?: boolean;
}

const ExpenseDetailPage = ({ isEditMode = false }: ExpenseDetailPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatAmount } = useCurrency();
  
  // Check if editMode is set in the location state
  const editModeFromState = location.state?.editMode === true;
  const shouldShowEditModal = isEditMode || editModeFromState;
  
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(shouldShowEditModal);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(shouldShowEditModal);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'not_found' | 'not_authorized' | 'general' | null>(null);
  
  // Helper to get expense ID from URL
  const getExpenseId = () => {
    if (!id) return '';
    
    // Handle direct UUID pattern (/expenses/123)
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return id;
    }
    
    // If we're at /expenses/edit/:id, ignore the "edit" part
    if (id === 'edit' && location.pathname.includes('/expenses/edit/')) {
      console.warn('Invalid URL pattern detected: /expenses/edit/ - should use state pattern instead');
      
      // The actual UUID will be in the next part of the URL
      const pathParts = location.pathname.split('/');
      const editIndex = pathParts.indexOf('edit');
      
      if (editIndex >= 0 && editIndex + 1 < pathParts.length) {
        const actualId = pathParts[editIndex + 1];
        console.log('Extracted actual ID from URL:', actualId);
        return actualId;
      }
    }
    
    // For any other patterns, return the ID as is
    return id;
  };
  
  // Use the settlement hook
  const { isLoading: settlementLoading, isSettled, message: settlementMessage } = useSettlementGuard(getExpenseId());
  
  console.log("ExpenseDetailPage: Rendering with URL param ID:", id);
  
  const loadExpense = async () => {
    try {
      setLoading(true);
      clearError();
      
      const expenseId = getExpenseId();
      console.log('Loading expense details:', expenseId);
      
      try {
        const expenseData = await getExpenseDetails(expenseId);
        setExpense(expenseData);
      } catch (err: any) {
        console.error('Error loading expense:', err);
        
        // Handle specific error codes
        if (err.code === 'NOT_FOUND') {
          setError('Expense not found');
          setErrorType('not_found');
        } else if (err.code === 'UNAUTHORIZED') {
          setError('You need to be logged in to view this expense');
          setErrorType('not_authorized');
        } else if (err.code === 'PERMISSION_DENIED') {
          setError('You do not have permission to view this expense');
          setErrorType('not_authorized');
        } else if (err.code === 'INVALID_ID') {
          setError('Invalid expense ID');
          setErrorType('not_found');
        } else {
          setError(err.message || 'An error occurred loading the expense');
          setErrorType('general');
        }
        
        setExpense(null);
      }
    } catch (error) {
      console.error('Unexpected error in loadExpense:', error);
      setError((error as Error).message || 'An unexpected error occurred');
      setErrorType('general');
      setExpense(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("ExpenseDetailPage: useEffect triggered");
    loadExpense().catch(err => {
      console.error('Failed to load expense details:', err);
      setError('Failed to load expense details');
      setErrorType('general');
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (expense) {
      // Update page title with expense amount
      document.title = `${formatAmount(expense.amount)} - Expense Detail`;
    }
    return () => {
      // Reset title when component unmounts
      document.title = 'Expenses';
    };
  }, [expense, formatAmount]);

  useEffect(() => {
    setEditModalError(null);
  }, [isEditModalOpen]);

  // Effect to set edit modal state when edit mode changes or expense loads
  useEffect(() => {
    if (shouldShowEditModal && expense && !loading) {
      console.log('Opening edit modal in edit mode');
      setShowEditModal(true);
      setIsEditModalOpen(true);
      
      // Clear the editMode from state to prevent reopening the modal on navigation
      if (editModeFromState && navigate) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [shouldShowEditModal, expense, loading, editModeFromState, navigate, location.pathname]);

  const handleBack = () => {
    console.log("ExpenseDetailPage: Navigating back");
    navigate('/expenses');
  };

  const handleEdit = () => {
    try {
      console.log('Attempting to open edit modal for expense:', expense);
      if (!expense) {
        throw new Error('No expense data available for editing');
      }
      setIsEditModalOpen(true);
    } catch (err) {
      const error = err as Error; // Type assertion for error
      console.error('Error opening edit modal:', error);
    }
  };

  const handleDelete = async () => {
    try {
      setShowDeleteConfirm(true);
    } catch (err) {
      const error = err as Error; // Type assertion for error
      console.error('Error preparing delete:', error);
    }
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      console.log('Attempting to delete expense:', getExpenseId());
      
      const result = await deleteExpense(getExpenseId());
      
      if (result.success) {
        console.log('Expense deleted successfully, navigating to expenses list');
        // Add a small delay to ensure all cleanup and state updates are completed
        setTimeout(() => {
          navigate('/expenses', { 
            state: { 
              message: 'Expense deleted successfully',
              action: 'delete',
              timestamp: new Date().getTime()
            } 
          });
        }, 300);
      } else {
        console.error('Delete operation failed:', result);
        setError(result.message || 'Failed to delete expense');
        setErrorType('general');
        // Close the modal even when there's an error
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting expense:', error);
      setError(error.message || 'Failed to delete the expense');
      setErrorType('general');
      // Close the modal even when there's an error
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  // Render function to handle error states
  const renderErrorState = () => {
    if (!errorType) return null;
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-amber-50 w-full max-w-md p-4 rounded-lg mb-6">
          <div className="flex items-center justify-center text-amber-700 mb-2">
            <AlertTriangle size={24} className="text-amber-500 mr-2" />
            <span className="text-lg font-medium">
              {errorType === 'not_found' ? 'Expense not found' : 
               errorType === 'not_authorized' ? 'Not authorized' : 
               'An error occurred'}
            </span>
          </div>
          <p className="text-amber-700">
            {error || 'The expense you are looking for could not be found or accessed.'}
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleBack}
            className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={clearError}
            className="px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Dismiss Error
          </button>
        </div>
      </div>
    );
  };
  
  // Clear error function
  const clearError = () => {
    setError(null);
    setErrorType(null);
  };

  const renderLocations = () => {
    // Show a single location
    if (expense.location && !expense.all_locations) {
      return (
        <div>
          <h2 className="text-sm font-medium text-gray-500">Location</h2>
          <p className="text-gray-900">{expense.location}</p>
        </div>
      );
    }
    
    // Show multiple locations
    if (expense.all_locations && expense.all_locations.length > 0) {
      return (
        <div>
          <h2 className="text-sm font-medium text-gray-500">
            {expense.all_locations.length > 1 ? 'Locations' : 'Location'}
          </h2>
          <div className="flex flex-wrap gap-2 mt-1">
            {expense.all_locations.map((location: string, index: number) => (
              <div key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                {location}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (loading || settlementLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div className="container mx-auto max-w-3xl py-6 px-4">
          {renderErrorState()}
        </div>
      </ErrorBoundary>
    );
  }

  if (!expense) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-amber-50 p-4 rounded-lg text-amber-700">
          <p className="font-medium">Expense not found</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={handleBack}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} className="mr-1" />
        <span>Back</span>
      </button>

      {isSettled && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start text-amber-800">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{settlementMessage}</p>
        </div>
      )}

      {!expense.isOwner && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start text-blue-800">
          <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">This expense was created by {expense.paid_by_name}. You can view it but cannot edit or delete it.</p>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Expense Details</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className={`flex items-center px-3 py-2 rounded-lg text-white text-sm ${
              isSettled || !expense.isOwner 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isSettled || !expense.isOwner}
            title={!expense.isOwner ? "You can only edit expenses that you created" : 
                   isSettled ? "Cannot edit a settled expense" : ""}
          >
            <Edit size={16} className="mr-1" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className={`flex items-center px-3 py-2 rounded-lg text-white text-sm ${
              isSettled || !expense.isOwner 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
            disabled={isSettled || !expense.isOwner}
            title={!expense.isOwner ? "You can only delete expenses that you created" : 
                   isSettled ? "Cannot delete a settled expense" : ""}
          >
            <Trash size={16} className="mr-1" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Expense Details */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {expense.category || 'Uncategorized'}
            </h1>
            <p className="text-3xl font-bold text-rose-500">
              {formatAmount(expense.amount)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Date</h2>
              <p className="text-gray-900">
                {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>

            {renderLocations()}

            {expense.notes && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Notes</h2>
                <p className="text-gray-900">{expense.notes}</p>
              </div>
            )}

            <div>
              <h2 className="text-sm font-medium text-gray-500">Split Type</h2>
              <p className="text-gray-900">
                {expense.split_type === 'equal' ? 'Equal Split (50/50)' : 'No Split (100%)'}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500">Paid By</h2>
              <p className="text-gray-900">
                {expense.paid_by_name || expense.paid_by_email || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error opening edit form: {editModalError}
        </div>
      )}

      {isEditModalOpen && (
        <ErrorBoundary fallback={<div className="text-red-500">Failed to load edit form</div>}>
          <NewExpenseModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onExpenseCreated={() => {
              setIsEditModalOpen(false);
              loadExpense();
            }}
            expenseToEdit={expense}
          />
        </ErrorBoundary>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseDetailPage; 