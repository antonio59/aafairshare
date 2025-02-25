-- Create enum for user roles if it doesn't exist
create type if not exists user_role as enum ('partner1', 'partner2');

-- Add role column to profiles table
alter table profiles 
add column if not exists role user_role;

-- Update existing profiles with roles
update profiles 
set role = case 
  when auth.email() = 'andypamo@gmail.com' then 'partner1'::user_role 
  else 'partner2'::user_role 
end;
