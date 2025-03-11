import { supabase } from '../core/api/supabase';
import { DatabaseError } from '../utils/errorHandling';
import { categoryCache, locationsCache, withCache } from '../utils/caching';
import { 
  DbCategory, 
  DbLocation,
  handleSingleResponse,
  handleManyResponse, _formatErrorResponse
} from '../core/utils/supabase-helpers';

// Improved type definitions using database schema types
type CategoryRecord = DbCategory;
type LocationRecord = DbLocation;

// Get all categories
export const getCategories = withCache<string[]>(categoryCache, 'all-categories', async () => {
  try {
    const response = await supabase
      .from('categories')
      .select('category')
      .order('category');

    // Use our utility function to safely handle the response
    const data = handleManyResponse<DbCategory>(response);
    return data.map(item => item.category);
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Error fetching categories', error);
  }
});

// Get all locations
export const getLocations = withCache<string[]>(locationsCache, 'all-locations', async () => {
  try {
    const response = await supabase
      .from('locations')
      .select('location')
      .order('location');

    // Use our utility function to safely handle the response
    const data = handleManyResponse<DbLocation>(response);
    return data.map(item => item.location);
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Error fetching locations', error);
  }
});

// Add new category
export const addCategory = async (category: string): Promise<CategoryRecord> => {
  try {
    const response = await supabase
      .from('categories')
      .insert({ category })
      .select()
      .single();

    // Use our utility function to safely handle the response
    const data = handleSingleResponse<DbCategory>(response);
    if (!data) throw new Error('Failed to add category');
    
    // Invalidate categories cache
    categoryCache.invalidate('all-categories');
    
    return data;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Error adding category', error);
  }
};

// Add new location
export const addLocation = async (location: string): Promise<LocationRecord> => {
  try {
    const response = await supabase
      .from('locations')
      .insert({ location })
      .select()
      .single();

    // Use our utility function to safely handle the response
    const data = handleSingleResponse<DbLocation>(response);
    if (!data) throw new Error('Failed to add location');
    
    // Invalidate locations cache
    locationsCache.invalidate('all-locations');
    
    return data;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Error adding location', error);
  }
}; 