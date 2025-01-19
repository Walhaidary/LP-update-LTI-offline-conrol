-- Drop and recreate the tickets table with proper constraints
CREATE OR REPLACE FUNCTION get_next_ticket_number() 
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_num integer;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(ticket_number, '\D', '', 'g'), '')::integer), 0) + 1 
  INTO next_num 
  FROM tickets;
  RETURN 'TKT-' || LPAD(next_num::text, 6, '0');
END;
$$;

-- Drop existing view
DROP VIEW IF EXISTS public.ticket_details_view;

-- Recreate tickets table with proper structure
CREATE TABLE IF NOT EXISTS public.tickets_new (
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
  vendor_code text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  original_created_at timestamptz DEFAULT now(),
  status_changed_at timestamptz DEFAULT now()
);

-- Copy data from old table to new table
INSERT INTO public.tickets_new (
  SELECT * FROM public.tickets
);

-- Drop old table and rename new table
DROP TABLE IF EXISTS public.tickets CASCADE;
ALTER TABLE public.tickets_new RENAME TO tickets;

-- Create indexes
CREATE INDEX idx_tickets_ticket_number ON public.tickets(ticket_number);
CREATE INDEX idx_tickets_version ON public.tickets(ticket_number, version DESC);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_vendor_code ON public.tickets(vendor_code);

-- Recreate the view
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
  t.vendor_code,
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

-- Create function to set ticket number before insert
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := get_next_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set ticket number
DROP TRIGGER IF EXISTS set_ticket_number_trigger ON tickets;
CREATE TRIGGER set_ticket_number_trigger
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Re-enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all operations for authenticated users"
ON public.tickets
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comments
COMMENT ON TABLE public.tickets IS 'Stores ticket information with versioning support';
COMMENT ON VIEW public.ticket_details_view IS 'Comprehensive view of tickets with related data';