-- First, disable RLS temporarily to allow the restructuring
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;

-- Drop the view to avoid dependency issues
DROP VIEW IF EXISTS public.ticket_details_view;

-- Create a new tickets table with correct structure
CREATE TABLE public.tickets_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  category_name text,
  department_name text,
  kpi_name text,
  assigned_to uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date timestamptz NOT NULL,
  incident_date timestamptz NOT NULL,
  accountability text,
  status_name text,
  attachment_name text,
  attachment_size integer CHECK (attachment_size <= 3145728),
  attachment_type text,
  attachment_path text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Copy data from old table to new table
INSERT INTO public.tickets_new (
  ticket_number, version, category_name, department_name, kpi_name,
  assigned_to, title, description, priority, due_date, incident_date,
  accountability, status_name, attachment_name, attachment_size,
  attachment_type, attachment_path, created_by, created_at
)
SELECT 
  ticket_number, version, category_name, department_name, kpi_name,
  assigned_to, title, description, priority, due_date, incident_date,
  accountability, status_name, attachment_name, attachment_size,
  attachment_type, attachment_path, created_by, created_at
FROM public.tickets;

-- Drop old table and rename new table
DROP TABLE public.tickets;
ALTER TABLE public.tickets_new RENAME TO tickets;

-- Recreate indexes
CREATE INDEX idx_tickets_ticket_number ON public.tickets(ticket_number);
CREATE INDEX idx_tickets_version ON public.tickets(ticket_number, version DESC);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);

-- Recreate the view
CREATE OR REPLACE VIEW public.ticket_details_view AS
SELECT 
  t.*,
  up.full_name as created_by_name,
  assigned.full_name as assigned_to_name
FROM public.tickets t
LEFT JOIN public.user_profiles up ON t.created_by = up.id
LEFT JOIN public.user_profiles assigned ON t.assigned_to = assigned.id;

-- Re-enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policy
CREATE POLICY "Allow all operations for authenticated users"
ON public.tickets
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant access to the view
GRANT SELECT ON public.ticket_details_view TO authenticated;