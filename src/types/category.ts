/**
 * Type definitions for category-related data
 * 
 * @module types/category
 */

/**
 * Represents a category record
 */
export interface Category {
  /** Unique identifier for the category */
  id: string;
  
  /** Name of the category */
  name: string;
  
  /** Optional description of the category */
  description?: string;
  
  /** Icon name for the category */
  icon?: string;
  
  /** Color code for the category visualization */
  color?: string;
  
  /** Timestamp when the category was created */
  created_at: string;
  
  /** Timestamp when the category was last updated */
  updated_at?: string;
}

/**
 * Data structure for creating a new category
 * Omits auto-generated fields like id and timestamps
 */
export type NewCategory = Omit<Category, 'id' | 'updated_at'>;

/**
 * Data structure for updating an existing category
 * Requires id and at least one other field
 */
export type UpdateCategory = Pick<Category, 'id'> & Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
