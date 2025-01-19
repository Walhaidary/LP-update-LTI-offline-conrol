-- Create enum for email event status
CREATE TYPE email_event_status AS ENUM (
  'created',
  'sending',
  'sent',
  'failed'
);

-- Create email_events table
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  ticket_number text NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  body text NOT NULL,
  status email_event_status NOT NULL DEFAULT 'created',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_email_events_ticket_id ON public.email_events(ticket_id);
CREATE INDEX idx_email_events_ticket_number ON public.email_events(ticket_number);
CREATE INDEX idx_email_events_status ON public.email_events(status);
CREATE INDEX idx_email_events_created_at ON public.email_events(created_at);

-- Create updated_at trigger
CREATE TRIGGER update_email_events_updated_at
  BEFORE UPDATE ON public.email_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate ticket exists
CREATE OR REPLACE FUNCTION validate_ticket()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE id = NEW.ticket_id 
    AND ticket_number = NEW.ticket_number
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Invalid ticket (ID: %, Number: %)', NEW.ticket_id, NEW.ticket_number;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate tickets
CREATE TRIGGER validate_ticket_trigger
  BEFORE INSERT OR UPDATE ON public.email_events
  FOR EACH ROW
  EXECUTE FUNCTION validate_ticket();

-- Create policies
CREATE POLICY "Users can view email events"
  ON public.email_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert email events"
  ON public.email_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Add comments
COMMENT ON TABLE public.email_events IS 
'Tracks all email notification events with their statuses and any error messages';

COMMENT ON COLUMN public.email_events.ticket_id IS
'References the ID of the ticket this email event is associated with';

COMMENT ON COLUMN public.email_events.ticket_number IS
'Stores the ticket number for easier querying and reference';