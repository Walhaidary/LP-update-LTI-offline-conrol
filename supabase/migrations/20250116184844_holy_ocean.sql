-- Add vendor_code column to tickets table
ALTER TABLE public.tickets
ADD COLUMN vendor_code text;

-- Create index for vendor_code
CREATE INDEX idx_tickets_vendor_code ON public.tickets(vendor_code);

-- Drop existing view
DROP VIEW IF EXISTS public.ticket_details_view;

-- Recreate view with vendor_code
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
  up.vendor_code as creator_vendor_code
FROM public.tickets t
LEFT JOIN public.user_profiles c ON t.created_by = c.id
LEFT JOIN public.user_profiles a ON t.assigned_to = a.id
LEFT JOIN public.user_profiles up ON t.created_by = up.id;

-- Drop existing RLS policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.tickets;

-- Create new RLS policies that consider vendor_code
CREATE POLICY "Users can view tickets they have access to"
ON public.tickets
FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by
  OR auth.uid() = assigned_to
  OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.vendor_code IS NOT NULL
    AND up.vendor_code = vendor_code
  )
);

CREATE POLICY "Users can insert tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
);

-- Grant access to the view
GRANT SELECT ON public.ticket_details_view TO authenticated;

-- Add comment explaining the changes
COMMENT ON COLUMN public.tickets.vendor_code IS 
'Vendor code to enable shared access between users from the same vendor';

COMMENT ON VIEW public.ticket_details_view IS 
'Comprehensive view of tickets with related data including vendor code for access control';