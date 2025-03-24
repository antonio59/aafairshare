'use client';

/**
 * CategoryList component
 * Displays and manages categories using Zustand store
 * 
 * @module components/categories/CategoryList
 */
import { useEffect, useState } from 'react';

import type { Category, NewCategory } from '@/types/category';

import { useCategoryStore, useUIStore } from '@/store';

/**
 * CategoryList props
 */
export interface CategoryListProps {
  /** CSS class name for custom styling */
  className?: string;
}

/**
 * CategoryList component
 * Lists categories and provides actions for managing them
 * 
 * @component
 */
export default function CategoryList({ className }: CategoryListProps) {
  // Local state for new category form
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    description: '',
    color: '#3B82F6', // Default blue color
    created_at: new Date().toISOString(),
  });
  
  // Get categories data and actions from Zustand store
  const { 
    categories, 
    isLoading, 
    error, 
    fetchCategories, 
    addCategory,
    deleteCategory 
  } = useCategoryStore();
  
  // Get UI actions from UI store
  const { showNotification } = useUIStore();
  
  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission to create a new category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addCategory(newCategory);
      setNewCategory({ name: '', description: '', color: '#3B82F6', created_at: new Date().toISOString() });
      showNotification('Category added successfully', 'success');
    } catch (error) {
      showNotification('Failed to add category', 'error');
      console.error('Error adding category:', error);
    }
  };
  
  // Handle category deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        showNotification('Category deleted successfully', 'success');
      } catch (error) {
        showNotification('Failed to delete category', 'error');
        console.error('Error deleting category:', error);
      }
    }
  };
  
  // Display loading state
  if (isLoading && categories.length === 0) {
    return <div className={className}>Loading categories...</div>;
  }
  
  // Display error state
  if (error) {
    return <div className={className}>Error: {error}</div>;
  }
  
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      
      {/* Add new category form */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Add New Category</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={newCategory.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Category name"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={newCategory.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Category description"
              rows={2}
            />
          </div>
          
          <div>
            <label htmlFor="color" className="block text-sm font-medium mb-1">
              Color
            </label>
            <div className="flex items-center">
              <input
                id="color"
                name="color"
                type="color"
                value={newCategory.color}
                onChange={handleInputChange}
                className="h-10 w-10 border border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-500">{newCategory.color}</span>
            </div>
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Category
          </button>
        </div>
      </form>
      
      {/* Display categories */}
      {categories.length === 0 ? (
        <p className="text-gray-500">No categories found. Add one above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category: Category) => (
            <div
              key={category.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Delete ${category.name}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              {category.color && (
                <div className="mt-2 flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-xs text-gray-500">{category.color}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}