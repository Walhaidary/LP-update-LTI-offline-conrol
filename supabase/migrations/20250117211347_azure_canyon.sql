-- Drop the foreign key constraint
ALTER TABLE public.email_events
DROP CONSTRAINT IF EXISTS email_events_ticket_number_fkey;

-- Create function to validate ticket number exists
CREATE OR REPLACE FUNCTION validate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE ticket_number = NEW.ticket_number
      LIMIT 1
    ) THEN
      RAISE EXCEPTION 'Invalid ticket number: %', NEW.ticket_number;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate ticket numbers
DROP TRIGGER IF EXISTS validate_ticket_number_trigger ON public.email_events;
CREATE TRIGGER validate_ticket_number_trigger
  BEFORE INSERT OR UPDATE ON public.email_events
  FOR EACH ROW
  EXECUTE FUNCTION validate_ticket_number();

-- Create index for ticket number lookups
CREATE INDEX IF NOT EXISTS idx_email_events_ticket_number ON public.email_events(ticket_number);

-- Add comment explaining the validation
COMMENT ON FUNCTION validate_ticket_number() IS 
'Validates that ticket numbers referenced in email_events exist in the tickets table';