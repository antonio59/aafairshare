-- Enable Row Level Security for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- Create consolidated policies
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