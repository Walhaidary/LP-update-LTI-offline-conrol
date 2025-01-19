-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_ticket_trigger ON public.email_events;
DROP FUNCTION IF EXISTS validate_ticket;

-- Create improved validation function
CREATE OR REPLACE FUNCTION validate_ticket()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate if ticket_number is provided
  IF NEW.ticket_number IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE ticket_number = NEW.ticket_number
      LIMIT 1
    ) THEN
      -- Store the event with error status instead of raising an exception
      NEW.status = 'failed';
      NEW.error_message = 'Invalid ticket number: ' || NEW.ticket_number;
      RETURN NEW;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER validate_ticket_trigger
  BEFORE INSERT OR UPDATE ON public.email_events
  FOR EACH ROW
  EXECUTE FUNCTION validate_ticket();

-- Add comment explaining the validation
COMMENT ON FUNCTION validate_ticket() IS 
'Validates ticket numbers in email_events and sets error status instead of raising exceptions';

-- Modify tickets table to ensure ID is always set
ALTER TABLE public.tickets
ALTER COLUMN id SET NOT NULL,
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add comment explaining the change
COMMENT ON COLUMN public.tickets.id IS 
'Unique identifier for the ticket. Automatically generated if not provided.';