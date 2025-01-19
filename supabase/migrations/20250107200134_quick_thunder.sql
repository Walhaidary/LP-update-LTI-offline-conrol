-- Drop the previous view if it exists
DROP VIEW IF EXISTS public.ticket_user_profiles;

-- Create a more comprehensive view for ticket details
CREATE OR REPLACE VIEW public.ticket_details_view AS
SELECT 
  t.*,
  c.name as category_name,
  d.name as department_name,
  k.name as kpi_name,
  s.name as status_name,
  up.full_name as created_by_name,
  assigned.full_name as assigned_to_name
FROM public.tickets t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.departments d ON t.department_id = d.id
LEFT JOIN public.kpis k ON t.kpi_id = k.id
LEFT JOIN public.statuses s ON t.status_id = s.id
LEFT JOIN public.user_profiles up ON t.created_by = up.id
LEFT JOIN public.user_profiles assigned ON t.assigned_to = assigned.id;

-- Grant access to authenticated users
GRANT SELECT ON public.ticket_details_view TO authenticated;

-- Update the ticket service to use this view
COMMENT ON VIEW public.ticket_details_view IS 'Comprehensive view of tickets with related data';