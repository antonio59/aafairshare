-- This migration creates the categories and locations tables if they don't exist

-- Create the categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(category)
);

-- Create the locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(location)
);

-- Enable Row Level Security for categories table (if not already enabled)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for locations table (if not already enabled)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Add comments to describe the tables
COMMENT ON TABLE public.categories IS 'Expense categories for better organization';
COMMENT ON TABLE public.locations IS 'Locations where expenses occur';

-- Add indices for faster searches
CREATE INDEX IF NOT EXISTS idx_categories_category ON public.categories(category);
CREATE INDEX IF NOT EXISTS idx_locations_location ON public.locations(location);

-- Add or update policies for categories

-- Allow all users to view all categories
DROP POLICY IF EXISTS "categories_select_policy" ON public.categories;
CREATE POLICY "categories_select_policy" 
ON public.categories FOR SELECT 
TO public
USING (true);

-- Allow all users to create categories
DROP POLICY IF EXISTS "categories_insert_policy" ON public.categories;
CREATE POLICY "categories_insert_policy" 
ON public.categories FOR INSERT 
TO public
WITH CHECK (true);

-- Allow all users to update any category
DROP POLICY IF EXISTS "categories_update_policy" ON public.categories;
CREATE POLICY "categories_update_policy" 
ON public.categories FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Allow all users to delete any category
DROP POLICY IF EXISTS "categories_delete_policy" ON public.categories;
CREATE POLICY "categories_delete_policy" 
ON public.categories FOR DELETE 
TO public
USING (true);

-- Add or update policies for locations

-- Allow all users to view all locations
DROP POLICY IF EXISTS "locations_select_policy" ON public.locations;
CREATE POLICY "locations_select_policy" 
ON public.locations FOR SELECT 
TO public
USING (true);

-- Allow all users to create locations
DROP POLICY IF EXISTS "locations_insert_policy" ON public.locations;
CREATE POLICY "locations_insert_policy" 
ON public.locations FOR INSERT 
TO public
WITH CHECK (true);

-- Allow all users to update any location
DROP POLICY IF EXISTS "locations_update_policy" ON public.locations;
CREATE POLICY "locations_update_policy" 
ON public.locations FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Allow all users to delete any location
DROP POLICY IF EXISTS "locations_delete_policy" ON public.locations;
CREATE POLICY "locations_delete_policy" 
ON public.locations FOR DELETE 
TO public
USING (true);
