-- This migration simplifies the authentication policies for a two-user system

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- Create simplified policies for profiles
CREATE POLICY "profiles_select_policy" 
ON profiles FOR SELECT 
TO public
USING (true);

CREATE POLICY "profiles_insert_policy" 
ON profiles FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "profiles_update_policy" 
ON profiles FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "profiles_delete_policy" 
ON profiles FOR DELETE 
TO public
USING (true);

-- Create simplified policies for users
CREATE POLICY "users_select_policy" 
ON public.users FOR SELECT 
TO public
USING (true);

CREATE POLICY "users_insert_policy" 
ON public.users FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "users_update_policy" 
ON public.users FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "users_delete_policy" 
ON public.users FOR DELETE 
TO public
USING (true);

-- Note: These policies allow public access for all operations
-- This is appropriate for a two-user system where both users need full access