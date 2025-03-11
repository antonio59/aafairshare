-- This migration adds the settled_at column to the settlements table

-- Add settled_at column if it doesn't exist
ALTER TABLE public.settlements
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMP WITH TIME ZONE;

-- Comment on the column to explain its purpose
COMMENT ON COLUMN public.settlements.settled_at IS 'Timestamp when the settlement was marked as completed'; 