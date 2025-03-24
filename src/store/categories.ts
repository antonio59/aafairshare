/**
 * Categories store using Zustand for state management
 * Manages categories data and operations
 * 
 * @module store/categories
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Category } from '@/types/category';

/**
 * Interface defining the categories store state and actions
 */
interface CategoryState {
  /** List of all categories */
  categories: Category[];
  /** Indicates if categories are being loaded */
  isLoading: boolean;
  /** Any error that occurred during data fetching */
  error: string | null;
  
  /**
   * Fetches all categories
   */
  fetchCategories: () => Promise<void>;
  
  /**
   * Adds a new category
   * @param category - The category data to add
   * @returns The newly created category
   */
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  
  /**
   * Updates an existing category
   * @param category - The category data with updated fields
   * @returns The updated category
   */
  updateCategory: (category: Category) => Promise<Category>;
  
  /**
   * Deletes a category by ID
   * @param id - The ID of the category to delete
   * @returns Success status
   */
  deleteCategory: (id: string) => Promise<boolean>;
}

/**
 * Category store with Zustand
 * Uses devtools middleware for Redux DevTools integration
 */
export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set) => ({
      categories: [],
      isLoading: false,
      error: null,
      
      fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/categories');
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch categories');
          }
          
          const data = await response.json();
          set({ categories: data, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
        }
      },
      
      addCategory: async (category) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add category');
          }
          
          const newCategory = await response.json();
          set(state => ({ 
            categories: [...state.categories, newCategory], 
            isLoading: false 
          }));
          
          return newCategory;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateCategory: async (category) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update category');
          }
          
          const updatedCategory = await response.json();
          set(state => ({
            categories: state.categories.map(item => 
              item.id === updatedCategory.id ? updatedCategory : item
            ),
            isLoading: false,
          }));
          
          return updatedCategory;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      deleteCategory: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/categories?id=${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete category');
          }
          
          set(state => ({
            categories: state.categories.filter(category => category.id !== id),
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          return false;
        }
      },
    }),
    { name: 'category-store' }
  )
);