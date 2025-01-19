-- Drop existing view and function
DROP VIEW IF EXISTS public.assignable_users;
DROP FUNCTION IF EXISTS public.get_assignable_users();

-- Recreate view without access level restriction
CREATE OR REPLACE VIEW public.assignable_users AS
SELECT id, username, full_name, access_level, vendor_code
FROM public.user_profiles;

-- Recreate secure wrapper function
CREATE OR REPLACE FUNCTION public.get_assignable_users()
RETURNS SETOF public.assignable_users
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT * FROM public.assignable_users;
$$;

-- Grant usage on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_assignable_users() TO authenticated;

-- Add comments
COMMENT ON VIEW public.assignable_users IS 'View of all users that can be assigned to tickets';
COMMENT ON FUNCTION public.get_assignable_users() IS 'Secure function to get all assignable users';