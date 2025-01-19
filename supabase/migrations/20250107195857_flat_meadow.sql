-- Add foreign key for created_by_profile
ALTER TABLE public.tickets
ADD CONSTRAINT tickets_created_by_profile_fkey
FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Create view for user profiles with tickets
CREATE OR REPLACE VIEW public.ticket_user_profiles AS
SELECT 
  t.ticket_number,
  t.version,
  t.created_by,
  up.full_name as created_by_name
FROM public.tickets t
JOIN public.user_profiles up ON t.created_by = up.id;

-- Grant access to authenticated users
GRANT SELECT ON public.ticket_user_profiles TO authenticated;