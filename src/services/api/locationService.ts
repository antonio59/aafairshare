
import { supabase } from "@/integrations/supabase/client";

// Get all locations from Supabase
export const getLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select('id, name');
    
  if (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
  
  return data;
};

// Create new location
export const createLocation = async (name: string): Promise<{ id: string, name: string }> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .insert({ name })
      .select('id, name')
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error creating location:", error);
    throw error;
  }
};

// Delete location
export const deleteLocation = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting location:", error);
    throw error;
  }
};
