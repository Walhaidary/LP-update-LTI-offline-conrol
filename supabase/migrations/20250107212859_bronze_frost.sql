-- Drop the view first to avoid dependency issues
DROP VIEW IF EXISTS public.ticket_details_view;

-- Now we can safely modify the table
ALTER TABLE public.tickets 
  DROP CONSTRAINT IF EXISTS tickets_category_id_fkey,
  DROP CONSTRAINT IF EXISTS tickets_department_id_fkey,
  DROP CONSTRAINT IF EXISTS tickets_kpi_id_fkey,
  DROP CONSTRAINT IF EXISTS tickets_status_id_fkey;

ALTER TABLE public.tickets
  DROP COLUMN IF EXISTS category_id,
  DROP COLUMN IF EXISTS department_id,
  DROP COLUMN IF EXISTS kpi_id,
  DROP COLUMN IF EXISTS status_id;

ALTER TABLE public.tickets
  ADD COLUMN category_name text,
  ADD COLUMN department_name text,
  ADD COLUMN kpi_name text,
  ADD COLUMN status_name text;

-- Recreate the view with new columns
CREATE VIEW public.ticket_details_view AS
SELECT 
  t.*,
  up.full_name as created_by_name,
  assigned.full_name as assigned_to_name
FROM public.tickets t
LEFT JOIN public.user_profiles up ON t.created_by = up.id
LEFT JOIN public.user_profiles assigned ON t.assigned_to = assigned.id;

-- Grant access to authenticated users
GRANT SELECT ON public.ticket_details_view TO authenticated;