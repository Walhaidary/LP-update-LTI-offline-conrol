-- Drop existing view
DROP VIEW IF EXISTS public.ticket_details_view;

-- Recreate view with vendor_code column
CREATE OR REPLACE VIEW public.ticket_details_view AS
SELECT 
  t.*,
  c.full_name as created_by_name,
  a.full_name as assigned_to_name,
  CASE 
    WHEN LOWER(t.status_name) IN ('closed', 'rejected', 'approved') THEN
      EXTRACT(DAY FROM (t.status_changed_at - t.original_created_at))::integer
    ELSE
      EXTRACT(DAY FROM (CURRENT_TIMESTAMP - t.original_created_at))::integer
  END as lead_time_days,
  t.vendor_code,  -- Add vendor_code directly from tickets table
  up.vendor_code as creator_vendor_code  -- Keep creator's vendor code as well
FROM public.tickets t
LEFT JOIN public.user_profiles c ON t.created_by = c.id
LEFT JOIN public.user_profiles a ON t.assigned_to = a.id
LEFT JOIN public.user_profiles up ON t.created_by = up.id;

-- Grant access to the view
GRANT SELECT ON public.ticket_details_view TO authenticated;

-- Add comment explaining the view
COMMENT ON VIEW public.ticket_details_view IS 
'Comprehensive view of tickets with related data including both ticket vendor_code and creator vendor_code';