-- Create a view for assignable users
CREATE OR REPLACE VIEW public.assignable_users AS
SELECT id, username, full_name, access_level
FROM public.user_profiles
WHERE access_level >= 2;

-- Create a secure wrapper function
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