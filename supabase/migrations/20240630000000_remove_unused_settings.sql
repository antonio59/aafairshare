-- This migration removes unused settings features
-- Since we no longer need currency selection, language settings, or preferences

-- 1. Drop the function and trigger that auto-creates settings records
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Remove the language column from users table as it's no longer needed
ALTER TABLE public.users
DROP COLUMN IF EXISTS language;

-- 3. Remove the preferences column as it's no longer used
ALTER TABLE public.users
DROP COLUMN IF EXISTS preferences;

-- 4. For settings table, we have two options:
-- Option 1: Remove specific columns but keep the table
-- Option 2: Drop the entire table if it's only for currency/language
-- We'll go with option 2 since we're removing all related features

-- Drop the settings table entirely as it's no longer needed
DROP TABLE IF EXISTS public.settings;

-- Update RLS policies for users table to reflect changes
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
CREATE POLICY "users_update_policy"
ON public.users FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Add a notice to logs about the changes
DO $$
BEGIN
  RAISE NOTICE 'Settings simplification complete. App now uses GBP exclusively with no user preferences or settings.';
END $$; 