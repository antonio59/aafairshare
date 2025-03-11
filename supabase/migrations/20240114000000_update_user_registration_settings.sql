-- This migration updates the user registration trigger to handle the new settings table structure

-- First, drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a new function to handle user registration
-- This function will update the user's preferences with default values
-- instead of creating entries in the settings table (which is now for global settings)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_currency TEXT;
BEGIN
  -- Get the default currency from global settings
  SELECT value::text INTO default_currency
  FROM public.settings
  WHERE key = 'default_currency';
  
  -- Remove quotes from the JSONB value if present
  default_currency := REPLACE(default_currency, '"', '');
  
  -- If no default currency is found, use GBP as fallback
  IF default_currency IS NULL THEN
    default_currency := 'GBP';
  END IF;
  
  -- Update the user's preferences
  UPDATE public.users
  SET 
    preferences = jsonb_build_object('currency', default_currency),
    language = (SELECT value::text FROM public.settings WHERE key = 'default_language')
  WHERE id = NEW.id AND NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = NEW.id AND preferences IS NOT NULL
  );

  -- Ensure the global settings exist (for first user registration)
  IF NOT EXISTS (SELECT 1 FROM public.settings WHERE key = 'default_currency') THEN
    -- Insert default global settings if they don't exist
    INSERT INTO public.settings (key, value, description)
    VALUES
      ('app_currencies', '["GBP", "USD", "EUR"]'::jsonb, 'Available currencies in the application'),
      ('default_currency', '"GBP"'::jsonb, 'Default currency for the application'),
      ('default_language', '"en"'::jsonb, 'Default application language')
    ON CONFLICT (key) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to automatically update user preferences
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add a comment explaining the purpose of this migration
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates default user preferences and ensures global settings exist upon user registration';