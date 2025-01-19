-- Drop the existing view
DROP VIEW IF EXISTS public.ticket_details_view;

-- Recreate the view with updated lead time calculation
CREATE OR REPLACE VIEW public.ticket_details_view AS
SELECT 
  t.id,
  t.ticket_number,
  t.version,
  t.category_name,
  t.department_name,
  t.kpi_name,
  t.assigned_to,
  t.title,
  t.description,
  t.priority,
  t.due_date,
  t.incident_date,
  t.accountability,
  t.status_name,
  t.attachment_name,
  t.attachment_size,
  t.attachment_type,
  t.attachment_path,
  t.created_by,
  t.created_at,
  t.original_created_at,
  t.status_changed_at,
  c.full_name as created_by_name,
  a.full_name as assigned_to_name,
  CASE 
    -- For closed/rejected/approved tickets, calculate days between status change and original creation
    WHEN LOWER(t.status_name) IN ('closed', 'rejected', 'approved') THEN
      EXTRACT(DAY FROM (t.status_changed_at - t.original_created_at))::integer
    -- For other tickets, calculate days between current time and original creation
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
'Comprehensive view of tickets with related data including lead time calculation.
Lead time is calculated as:
- For closed/rejected/approved tickets: Days between status change and original creation date
- For other tickets: Days between current time and original creation date';