-- This migration fixes an issue where user names were being removed during the user registration process

-- First, drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create an improved function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_currency TEXT;
  user_name TEXT;
BEGIN
  -- Get the default currency from global settings
  BEGIN
    SELECT value::text INTO default_currency
    FROM public.settings
    WHERE key = 'default_currency';
  EXCEPTION WHEN OTHERS THEN
    default_currency := 'GBP';
  END;
  
  -- Remove quotes from the JSONB value if present
  default_currency := COALESCE(REPLACE(default_currency, '"', ''), 'GBP');
  
  -- Get the user's name from auth.users metadata if available
  BEGIN
    SELECT raw_user_meta_data->>'name' INTO user_name
    FROM auth.users
    WHERE id = NEW.id;
  EXCEPTION WHEN OTHERS THEN
    user_name := '';
  END;
  
  -- Create or update user entry
  BEGIN
    INSERT INTO public.users (
      id,
      email,
      name,
      preferences,
      language,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(user_name, ''),
      jsonb_build_object('currency', default_currency),
      'en',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = COALESCE(EXCLUDED.email, public.users.email),
      name = COALESCE(EXCLUDED.name, public.users.name),
      preferences = COALESCE(public.users.preferences, EXCLUDED.preferences),
      language = COALESCE(public.users.language, EXCLUDED.language),
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE NOTICE 'Error creating user entry: %', SQLERRM;
  END;

  -- Ensure the global settings exist
  BEGIN
    INSERT INTO public.settings (key, value, description)
    VALUES
      ('app_currencies', '["GBP", "USD", "EUR"]'::jsonb, 'Available currencies in the application'),
      ('default_currency', '"GBP"'::jsonb, 'Default currency for the application'),
      ('default_language', '"en"'::jsonb, 'Default application language')
    ON CONFLICT (key) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE NOTICE 'Error ensuring global settings: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to automatically update user preferences
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add a comment explaining the purpose of this migration
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates default user preferences while preserving existing user data including name';