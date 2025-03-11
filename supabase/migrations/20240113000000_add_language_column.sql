-- Add language column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Update existing users to have the default language
UPDATE public.users
SET language = 'en'
WHERE language IS NULL;

-- Ensure preferences column exists
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add language to the preferences JSONB column as well for flexibility
-- First check if the preferences column exists to avoid errors
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'preferences'
  ) THEN
    -- Only update if the column exists
    UPDATE public.users
    SET preferences = preferences || jsonb_build_object('language', COALESCE(language, 'en'))
    WHERE preferences -> 'language' IS NULL;
  END IF;
END
$$;