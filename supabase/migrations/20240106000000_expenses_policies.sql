-- This migration adds Row Level Security (RLS) policies for the expenses table

-- Enable Row Level Security for expenses table
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "expenses_select_policy" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert_policy" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update_policy" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete_policy" ON public.expenses;

-- Create simplified policies for expenses
-- These policies allow public access for all operations

-- Allow all users to view all expenses
CREATE POLICY "expenses_select_policy" 
ON public.expenses FOR SELECT 
TO public
USING (true);

-- Allow all users to create expenses
CREATE POLICY "expenses_insert_policy" 
ON public.expenses FOR INSERT 
TO public
WITH CHECK (true);

-- Allow all users to update any expense
CREATE POLICY "expenses_update_policy" 
ON public.expenses FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Allow all users to delete any expense
CREATE POLICY "expenses_delete_policy" 
ON public.expenses FOR DELETE 
TO public
USING (true);

-- Note: These policies allow public access for all operations
-- This is appropriate for a two-user system where both users need full access