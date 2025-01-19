-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

-- Create function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate new ticket number for version 1 (new tickets)
  IF NEW.version = 1 THEN
    NEW.ticket_number := 'TKT-' || LPAD(nextval('ticket_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ticket number
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

-- Set default version to 1 for new tickets
ALTER TABLE public.tickets 
ALTER COLUMN version SET DEFAULT 1;