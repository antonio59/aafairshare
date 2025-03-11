-- This migration simplifies the user profile structure by removing the profiles table
-- and creating a new settings table to store user preferences

-- First, create the new settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_currency TEXT NOT NULL DEFAULT 'GBP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies for the settings table
CREATE POLICY "settings_select_policy" 
ON public.settings FOR SELECT 
TO public
USING (true);

CREATE POLICY "settings_insert_policy" 
ON public.settings FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "settings_update_policy" 
ON public.settings FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "settings_delete_policy" 
ON public.settings FOR DELETE 
TO public
USING (true);

-- Migrate data from profiles to settings (if profiles table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    INSERT INTO public.settings (id, default_currency, created_at, updated_at)
    SELECT id, default_currency, created_at, updated_at
    FROM public.profiles
    ON CONFLICT (id) DO NOTHING;
  END IF;
END
$$;

-- Note: We're not dropping the profiles table immediately to ensure a smooth transition
-- A future migration can drop the profiles table after the application has been updated
-- to use the new settings table instead