-- Drop email-related triggers first
DROP TRIGGER IF EXISTS ticket_assignment_notification ON public.tickets;

-- Drop email-related functions
DROP FUNCTION IF EXISTS notify_ticket_assignment();
DROP FUNCTION IF EXISTS send_email_via_edge_function(text, text, text, jsonb);
DROP FUNCTION IF EXISTS send_test_email(text, text, text, jsonb);
DROP FUNCTION IF EXISTS validate_ticket();

-- Drop email-related tables
DROP TABLE IF EXISTS public.email_events;
DROP TABLE IF EXISTS public.email_templates;
DROP TABLE IF EXISTS public.email_config;

-- Drop email event status enum
DROP TYPE IF EXISTS email_event_status;

-- Add comment explaining the migration
COMMENT ON MIGRATION IS 'Removes all email-related tables and functions as SMTP functionality is no longer needed';