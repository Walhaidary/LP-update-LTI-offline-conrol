-- Drop existing view
DROP VIEW IF EXISTS public.ticket_details_view;

-- Recreate view with vendor_code from tickets table
CREATE OR REPLACE VIEW public.ticket_details_view AS
SELECT 
  t.*,
  c.full_name as created_by_name,
  c.vendor_code as vendor_code, -- Add vendor_code from creator's profile
  a.full_name as assigned_to_name,
  CASE 
    WHEN LOWER(t.status_name) IN ('closed', 'rejected', 'approved') THEN
      EXTRACT(DAY FROM (t.status_changed_at - t.original_created_at))::integer
    ELSE
      EXTRACT(DAY FROM (CURRENT_TIMESTAMP - t.original_created_at))::integer
  END as lead_time_days
FROM public.tickets t
LEFT JOIN public.user_profiles c ON t.created_by = c.id
LEFT JOIN public.user_profiles a ON t.assigned_to = a.id;

-- Grant access to the view
GRANT SELECT ON public.ticket_details_view TO authenticated;

-- Add comment explaining the view
COMMENT ON VIEW public.ticket_details_view IS 
'Comprehensive view of tickets with related data including vendor_code from creator profile';

-- Create index on vendor_code in user_profiles if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_vendor_code ON public.user_profiles(vendor_code);