-- This migration adds Row Level Security (RLS) policies for the categories table

-- Enable Row Level Security for categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "categories_select_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_update_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON public.categories;

-- Create simplified policies for categories
-- These policies allow public access for all operations

-- Allow all users to view all categories
CREATE POLICY "categories_select_policy" 
ON public.categories FOR SELECT 
TO public
USING (true);

-- Allow all users to create categories
CREATE POLICY "categories_insert_policy" 
ON public.categories FOR INSERT 
TO public
WITH CHECK (true);

-- Allow all users to update any category
CREATE POLICY "categories_update_policy" 
ON public.categories FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Allow all users to delete any category
CREATE POLICY "categories_delete_policy" 
ON public.categories FOR DELETE 
TO public
USING (true);

-- Note: These policies allow public access for all operations
-- This is appropriate for a two-user system where both users need full access