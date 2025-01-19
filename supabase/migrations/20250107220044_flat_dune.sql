-- Drop existing trigger
DROP TRIGGER IF EXISTS set_ticket_number ON public.tickets;
DROP FUNCTION IF EXISTS generate_ticket_number;

-- Create improved function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate new ticket number for version 1 (new tickets)
  -- AND when ticket_number is not already set
  IF NEW.version = 1 AND NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'TKT-' || LPAD(nextval('ticket_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

-- Add comment explaining the function
COMMENT ON FUNCTION generate_ticket_number() IS 
'Generates ticket number only for new tickets (version 1) and only when ticket_number is not provided';