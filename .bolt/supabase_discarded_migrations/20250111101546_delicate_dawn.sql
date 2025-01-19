/*
  # Create Approval Tickets Table

  1. New Tables
    - `approval_tickets`
      - `id` (uuid, primary key)
      - `ticket_number` (text, unique)
      - `status` (text, enum)
      - `due_date` (timestamptz)
      - `transporter_code` (text, nullable)
      - `created_at` (timestamptz)
      - `created_by` (uuid)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create enum for approval ticket status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_ticket_status') THEN
    CREATE TYPE approval_ticket_status AS ENUM (
      'pending',
      'approved',
      'rejected',
      'expired'
    );
  END IF;
END $$;

-- Create approval_tickets table
CREATE TABLE IF NOT EXISTS public.approval_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  status approval_ticket_status NOT NULL DEFAULT 'pending',
  due_date timestamptz NOT NULL,
  transporter_code text REFERENCES public.service_providers(vendor_code),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.approval_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view approval tickets"
  ON public.approval_tickets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage approval tickets"
  ON public.approval_tickets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND access_level >= 5
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND access_level >= 5
    )
  );

-- Create indexes
CREATE INDEX idx_approval_tickets_number ON public.approval_tickets(ticket_number);
CREATE INDEX idx_approval_tickets_status ON public.approval_tickets(status);
CREATE INDEX idx_approval_tickets_due_date ON public.approval_tickets(due_date);

-- Create trigger to update updated_at
CREATE TRIGGER update_approval_tickets_updated_at
  BEFORE UPDATE ON public.approval_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment explaining the table
COMMENT ON TABLE public.approval_tickets IS 
'Stores approval tickets for offline dispatches with status tracking and transporter assignment';