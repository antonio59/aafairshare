-- This migration adds a column_exists function to check if a column exists in a table

-- Create or replace the function to check if a column exists
CREATE OR REPLACE FUNCTION column_exists(
  table_name text,
  column_name text
) RETURNS boolean 
LANGUAGE plpgsql
AS $$
DECLARE
  exists boolean;
BEGIN
  SELECT COUNT(*) > 0 INTO exists
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = column_exists.table_name
    AND column_name = column_exists.column_name;
  RETURN exists;
END;
$$;

-- Add security definer to ensure it runs with the privileges of the creator
ALTER FUNCTION column_exists(text, text) SECURITY DEFINER;

-- Set permissions to allow public access
GRANT EXECUTE ON FUNCTION column_exists(text, text) TO PUBLIC; 