-- Update split types in expenses table
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'expenses_split_type_check'
    AND table_name = 'expenses'
  ) THEN
    ALTER TABLE expenses DROP CONSTRAINT expenses_split_type_check;
  END IF;
END $$;

-- First update existing records to match new split types
UPDATE expenses
  SET split_type = CASE
    WHEN split_type = '50/50' THEN 'Equal'
    WHEN split_type = '100' THEN 'No Split'
    ELSE 'Equal'  -- Default to Equal for any other values
  END;

-- Then add the constraint after data is consistent
ALTER TABLE expenses
  ADD CONSTRAINT expenses_split_type_check CHECK (split_type IN ('Equal', 'No Split'));