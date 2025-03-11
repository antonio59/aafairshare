-- This migration fixes foreign key constraints and ensures proper transition from profiles to settings

-- First, ensure the settings table exists and has the correct structure
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_currency TEXT NOT NULL DEFAULT 'GBP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS is enabled
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "settings_select_policy" ON public.settings;
DROP POLICY IF EXISTS "settings_insert_policy" ON public.settings;
DROP POLICY IF EXISTS "settings_update_policy" ON public.settings;
DROP POLICY IF EXISTS "settings_delete_policy" ON public.settings;

-- Create improved policies that handle the auth flow better
CREATE POLICY "settings_select_policy"
ON public.settings FOR SELECT
TO public
USING (true);

-- Allow settings creation during signup
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

-- Create a function to automatically create settings entry when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.settings (id, default_currency, created_at, updated_at)
  VALUES (
    NEW.id,
    'GBP',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to automatically create settings
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migrate any remaining data from profiles to settings if profiles table still exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    INSERT INTO public.settings (id, default_currency, created_at, updated_at)
    SELECT id, default_currency, created_at, updated_at
    FROM public.profiles
    ON CONFLICT (id) DO NOTHING;
  END IF;
END
$$;