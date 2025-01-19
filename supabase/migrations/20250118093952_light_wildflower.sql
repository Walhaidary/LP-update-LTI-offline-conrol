-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_ticket_trigger ON public.email_events;
DROP FUNCTION IF EXISTS validate_ticket;

-- Create improved validation function that checks ticket number only
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

-- Drop existing notify_ticket_assignment trigger and function
DROP TRIGGER IF EXISTS ticket_assignment_notification ON public.tickets;
DROP FUNCTION IF EXISTS notify_ticket_assignment;

-- Create improved notification function
CREATE OR REPLACE FUNCTION notify_ticket_assignment()
RETURNS TRIGGER AS $$
DECLARE
  config public.email_config%ROWTYPE;
  template public.email_templates%ROWTYPE;
  assignee public.user_profiles%ROWTYPE;
  email_body text;
  email_subject text;
BEGIN
  -- Only proceed if assigned_to has changed and is not null
  IF (TG_OP = 'INSERT' OR OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) 
     AND NEW.assigned_to IS NOT NULL 
     AND NEW.ticket_number IS NOT NULL THEN  -- Ensure ticket number exists
    
    -- Get email configuration
    SELECT * INTO config FROM public.email_config LIMIT 1;
    IF NOT FOUND THEN
      RAISE NOTICE 'Email configuration not found';
      RETURN NEW;
    END IF;

    -- Get email template
    SELECT * INTO template 
    FROM public.email_templates 
    WHERE name = 'ticket_assignment';
    
    IF NOT FOUND THEN
      RAISE NOTICE 'Email template not found';
      RETURN NEW;
    END IF;

    -- Get assignee details
    SELECT * INTO assignee 
    FROM public.user_profiles 
    WHERE id = NEW.assigned_to;
    
    IF NOT FOUND THEN
      RAISE NOTICE 'Assignee not found';
      RETURN NEW;
    END IF;

    -- Replace placeholders in template
    email_body := template.body;
    email_body := REPLACE(email_body, '{{assignee_name}}', assignee.full_name);
    email_body := REPLACE(email_body, '{{ticket_number}}', NEW.ticket_number);
    email_body := REPLACE(email_body, '{{ticket_title}}', NEW.title);
    email_body := REPLACE(email_body, '{{category}}', NEW.category_name);
    email_body := REPLACE(email_body, '{{department}}', NEW.department_name);
    email_body := REPLACE(email_body, '{{priority}}', NEW.priority);
    email_body := REPLACE(email_body, '{{due_date}}', NEW.due_date::text);

    -- Replace placeholders in subject
    email_subject := REPLACE(template.subject, '{{ticket_number}}', NEW.ticket_number);

    -- Create email event record
    INSERT INTO public.email_events (
      ticket_id,
      ticket_number,
      recipient_email,
      recipient_name,
      subject,
      body,
      status,
      created_by
    ) VALUES (
      NEW.id,
      NEW.ticket_number,
      assignee.email,
      NEW.assigned_to::text,
      email_subject,
      email_body,
      'created',
      auth.uid()
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent ticket creation
    RAISE NOTICE 'Error in notify_ticket_assignment: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that runs AFTER INSERT OR UPDATE
CREATE TRIGGER ticket_assignment_notification
  AFTER INSERT OR UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_assignment();

-- Add comment explaining the function
COMMENT ON FUNCTION notify_ticket_assignment() IS 
'Handles ticket assignment notifications by creating email events and sending emails. Includes better error handling.';