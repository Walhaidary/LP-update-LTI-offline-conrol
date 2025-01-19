-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_ticket_trigger ON public.email_events;
DROP FUNCTION IF EXISTS validate_ticket;

-- Create improved validation function that only checks ticket number
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
    END IF;
  END IF;
  
  -- Set ticket_id to NULL to avoid validation errors
  NEW.ticket_id = NULL;
  
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
'Validates ticket numbers in email_events and sets error status instead of raising exceptions. Ignores ticket_id field.';

-- Modify email_events table to make ticket_id nullable
ALTER TABLE public.email_events
ALTER COLUMN ticket_id DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN public.email_events.ticket_id IS 
'Optional reference to ticket ID. Not required since we have ticket_number.';