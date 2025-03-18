-- Add new columns for monthly expense tracking and settlement status
ALTER TABLE settlements
ADD COLUMN IF NOT EXISTS is_settled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS settled_date TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS settlements_is_settled_idx ON settlements(is_settled);

-- Update the settlements table policies
DROP POLICY IF EXISTS "settlements_select_policy" ON settlements;
DROP POLICY IF EXISTS "settlements_update_policy" ON settlements;

-- Allow all authenticated users to view settlements
CREATE POLICY "settlements_select_policy"
ON settlements FOR SELECT
TO public
USING (true);

-- Allow all authenticated users to update settlements
CREATE POLICY "settlements_update_policy"
ON settlements FOR UPDATE
TO public
USING (true)
WITH CHECK (true);