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
  END as lead_time_days
FROM public.tickets t
LEFT JOIN public.user_profiles c ON t.created_by = c.id
LEFT JOIN public.user_profiles a ON t.assigned_to = a.id;

-- Grant access to the view
GRANT SELECT ON public.ticket_details_view TO authenticated;

-- Add comment explaining the view
COMMENT ON VIEW public.ticket_details_view IS 
'Comprehensive view of tickets with related data including lead time calculation';

-- Create function to automatically set vendor_code on ticket insert
CREATE OR REPLACE FUNCTION set_ticket_vendor_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the vendor code from the creator's profile
  SELECT vendor_code INTO NEW.vendor_code
  FROM public.user_profiles
  WHERE id = NEW.created_by;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set vendor_code
CREATE TRIGGER set_ticket_vendor_code_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_vendor_code();