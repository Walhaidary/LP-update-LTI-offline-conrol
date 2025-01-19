-- Update the check constraint on user_profiles table
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_access_level_check;

ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_access_level_check 
CHECK (access_level BETWEEN 0 AND 5);

-- Add comment explaining access levels
COMMENT ON COLUMN public.user_profiles.access_level IS 
'User access level:
0 - Service Provider
1 - Monitor
2 - Manage SC
3 - Store Keeper
4 - WH Manager
5 - Admin';