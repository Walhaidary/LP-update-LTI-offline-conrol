-- Drop existing tables
DROP TABLE IF EXISTS public.ticket_attachments;
DROP TABLE IF EXISTS public.ticket_details;
DROP TABLE IF EXISTS public.tickets;

-- Create new tickets table with version tracking
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL,
  version integer NOT NULL,
  category_id uuid REFERENCES public.categories(id),
  department_id uuid REFERENCES public.departments(id),
  kpi_id uuid REFERENCES public.kpis(id),
  assigned_to uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date timestamptz NOT NULL,
  incident_date timestamptz NOT NULL,
  accountability text,
  status_id uuid REFERENCES public.statuses(id),
  attachment_name text,
  attachment_size integer CHECK (attachment_size <= 3145728),
  attachment_type text,
  attachment_path text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  
  -- Make composite primary key of ticket_number and version
  PRIMARY KEY (ticket_number, version)
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view tickets" ON public.tickets 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert tickets" ON public.tickets 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_tickets_ticket_number ON public.tickets(ticket_number);
CREATE INDEX idx_tickets_category ON public.tickets(category_id);
CREATE INDEX idx_tickets_department ON public.tickets(department_id);
CREATE INDEX idx_tickets_kpi ON public.tickets(kpi_id);
CREATE INDEX idx_tickets_status ON public.tickets(status_id);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);