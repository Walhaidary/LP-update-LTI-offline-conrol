-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id),
  department_id uuid REFERENCES public.departments(id),
  kpi_id uuid REFERENCES public.kpis(id),
  title text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date timestamptz NOT NULL,
  incident_date timestamptz NOT NULL,
  accountability text,
  status_id uuid REFERENCES public.statuses(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ticket_details table for tracking ticket updates/comments
CREATE TABLE IF NOT EXISTS public.ticket_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE,
  description text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE,
  filename text NOT NULL,
  filesize integer NOT NULL CHECK (filesize <= 3145728), -- 3MB limit in bytes
  content_type text NOT NULL,
  storage_path text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view tickets" ON public.tickets 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert tickets" ON public.tickets 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view ticket details" ON public.ticket_details 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert ticket details" ON public.ticket_details 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view ticket attachments" ON public.ticket_attachments 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert ticket attachments" ON public.ticket_attachments 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Create updated_at trigger for tickets table
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_tickets_category ON public.tickets(category_id);
CREATE INDEX idx_tickets_department ON public.tickets(department_id);
CREATE INDEX idx_tickets_kpi ON public.tickets(kpi_id);
CREATE INDEX idx_tickets_status ON public.tickets(status_id);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_ticket_details_ticket ON public.ticket_details(ticket_id);
CREATE INDEX idx_ticket_attachments_ticket ON public.ticket_attachments(ticket_id);