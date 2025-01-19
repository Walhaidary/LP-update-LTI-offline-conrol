-- Drop existing trigger and function
DROP TRIGGER IF EXISTS set_ticket_number ON public.tickets;
DROP FUNCTION IF EXISTS generate_ticket_number;

-- Create improved function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  new_number text;
BEGIN
  -- Generate new ticket number
  SELECT 'TKT-' || LPAD(nextval('ticket_number_seq')::text, 6, '0')
  INTO new_number;
  
  -- Set the ticket number
  NEW.ticket_number := new_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs BEFORE INSERT
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();

-- Add comment explaining the function
COMMENT ON FUNCTION generate_ticket_number() IS 
'Generates ticket number for new tickets when ticket_number is not provided';