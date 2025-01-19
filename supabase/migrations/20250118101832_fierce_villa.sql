-- Drop existing trigger and function
DROP TRIGGER IF EXISTS ticket_assignment_notification ON public.tickets;

-- Drop email-related functions
DROP FUNCTION IF EXISTS notify_ticket_assignment();
DROP FUNCTION IF EXISTS send_email_via_edge_function(text, text, text, jsonb);
DROP FUNCTION IF EXISTS send_test_email(text, text, text, jsonb);
DROP FUNCTION IF EXISTS validate_ticket();

-- Drop email-related tables
DROP TABLE IF EXISTS public.email_events CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.email_config CASCADE;

-- Drop email event status enum
DROP TYPE IF EXISTS email_event_status;

-- Create function to update status_changed_at
CREATE OR REPLACE FUNCTION update_status_changed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update status_changed_at if status has changed
  IF OLD.status_name IS DISTINCT FROM NEW.status_name THEN
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update status_changed_at
CREATE TRIGGER update_ticket_status_changed_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_status_changed_at();

-- Add comment explaining the migration
COMMENT ON MIGRATION IS 'Removes all email-related tables and functions, keeps status change tracking';