-- Drop existing view
DROP VIEW IF EXISTS public.ticket_details_view;

-- Create view that shows latest version by default
CREATE VIEW public.ticket_details_view AS
WITH latest_versions AS (
  SELECT DISTINCT ON (ticket_number)
    *
  FROM public.tickets
  ORDER BY ticket_number, version DESC
)
SELECT 
  t.*,
  up.full_name as created_by_name,
  assigned.full_name as assigned_to_name
FROM latest_versions t
LEFT JOIN public.user_profiles up ON t.created_by = up.id
LEFT JOIN public.user_profiles assigned ON t.assigned_to = assigned.id;

-- Grant access to authenticated users
GRANT SELECT ON public.ticket_details_view TO authenticated;

-- Add comment explaining the view
COMMENT ON VIEW public.ticket_details_view IS 
'Shows latest version of tickets by default with related user information';