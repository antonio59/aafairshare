
import { supabase } from "@/integrations/supabase/client";

// Get all categories from Supabase
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, color, icon')
    .order('name');
    
  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
  
  return data;
};

// Create new category
export const createCategory = async (name: string, icon?: string, color?: string): Promise<{ id: string, name: string, icon?: string, color?: string }> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, icon, color })
      .select('id, name, icon, color')
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
