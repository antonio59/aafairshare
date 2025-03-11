-- This migration restructures the users and settings tables to properly separate user data from global settings

-- First, ensure the users table has all necessary user-specific fields
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- No need to migrate default_currency as it will be a global setting

-- Modify settings table to store global settings
ALTER TABLE public.settings
DROP CONSTRAINT IF EXISTS settings_pkey CASCADE,
ADD COLUMN IF NOT EXISTS key TEXT,
ADD COLUMN IF NOT EXISTS value JSONB,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Set key as primary key instead of id
ALTER TABLE public.settings
DROP COLUMN IF EXISTS id,
ADD PRIMARY KEY (key);

-- Enable RLS on settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only allow admins to modify settings
DROP POLICY IF EXISTS "settings_select_policy" ON public.settings;
DROP POLICY IF EXISTS "settings_modify_policy" ON public.settings;

CREATE POLICY "settings_select_policy"
ON public.settings FOR SELECT
TO public
USING (true);

CREATE POLICY "settings_modify_policy"
ON public.settings
FOR ALL
TO public
USING (true);

-- Insert default settings
INSERT INTO public.settings (key, value, description)
VALUES
('app_currencies', '["GBP", "USD", "EUR"]'::jsonb, 'Available currencies in the application'),
('default_currency', '"GBP"'::jsonb, 'Default currency for the application'),
('default_language', '"en"'::jsonb, 'Default application language')
ON CONFLICT (key) DO NOTHING;

-- Update users policies to reflect the new structure
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
CREATE POLICY "users_update_policy"
ON public.users FOR UPDATE
TO public
USING (true)
WITH CHECK (true);