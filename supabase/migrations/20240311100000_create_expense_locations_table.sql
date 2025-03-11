-- This migration adds support for multiple locations per expense
-- It creates a junction table to establish a many-to-many relationship

-- Create the expense_locations junction table
CREATE TABLE IF NOT EXISTS public.expense_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(expense_id, location_id)
);

-- Add indices for faster joins
CREATE INDEX IF NOT EXISTS idx_expense_locations_expense_id ON public.expense_locations(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_locations_location_id ON public.expense_locations(location_id);

-- Enable Row Level Security for the junction table
ALTER TABLE public.expense_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the junction table
DROP POLICY IF EXISTS "expense_locations_select_policy" ON public.expense_locations;
CREATE POLICY "expense_locations_select_policy" 
ON public.expense_locations FOR SELECT 
TO public
USING (true);

DROP POLICY IF EXISTS "expense_locations_insert_policy" ON public.expense_locations;
CREATE POLICY "expense_locations_insert_policy" 
ON public.expense_locations FOR INSERT 
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "expense_locations_delete_policy" ON public.expense_locations;
CREATE POLICY "expense_locations_delete_policy" 
ON public.expense_locations FOR DELETE 
TO public
USING (true);

-- Add a trigger to populate expense_locations when location_id is updated on expenses
CREATE OR REPLACE FUNCTION populate_expense_locations()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only proceed if location_id is not null
    IF NEW.location_id IS NOT NULL THEN
        -- Insert into junction table if not exists
        INSERT INTO public.expense_locations (expense_id, location_id)
        VALUES (NEW.id, NEW.location_id)
        ON CONFLICT (expense_id, location_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS expense_location_update_trigger ON public.expenses;
CREATE TRIGGER expense_location_update_trigger
AFTER INSERT OR UPDATE OF location_id ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION populate_expense_locations();

-- Migrate existing data to the junction table
INSERT INTO public.expense_locations (expense_id, location_id)
SELECT id, location_id
FROM public.expenses
WHERE location_id IS NOT NULL
ON CONFLICT (expense_id, location_id) DO NOTHING;

-- Add a comment explaining the purpose of this migration
COMMENT ON TABLE public.expense_locations IS 'Junction table for many-to-many relationship between expenses and locations';
COMMENT ON FUNCTION public.populate_expense_locations() IS 'Automatically populates expense_locations when location_id is set on expenses'; 