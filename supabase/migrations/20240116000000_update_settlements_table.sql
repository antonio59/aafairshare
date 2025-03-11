-- This migration updates the settlements table structure to support monthly summaries

-- Drop existing table
DROP TABLE settlements;

-- Recreate settlements table with new structure
CREATE TABLE settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "settlements_select_policy" ON settlements;
DROP POLICY IF EXISTS "settlements_insert_policy" ON settlements;
DROP POLICY IF EXISTS "settlements_update_policy" ON settlements;
DROP POLICY IF EXISTS "settlements_delete_policy" ON settlements;

-- Create simplified policies for settlements
-- Allow all users to view all settlements
CREATE POLICY "settlements_select_policy"
ON settlements FOR SELECT
TO public
USING (true);

-- Allow users to create their own settlements
CREATE POLICY "settlements_insert_policy"
ON settlements FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own settlements
CREATE POLICY "settlements_update_policy"
ON settlements FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own settlements
CREATE POLICY "settlements_delete_policy"
ON settlements FOR DELETE
TO public
USING (auth.uid() = user_id);


-- Add indexes for better query performance
CREATE INDEX settlements_user_id_idx ON settlements(user_id);
CREATE INDEX settlements_month_year_idx ON settlements(month_year);