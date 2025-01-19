-- Drop existing trigger and function
DROP TRIGGER IF EXISTS ticket_assignment_notification ON public.tickets;
DROP FUNCTION IF EXISTS notify_ticket_assignment;

-- Create improved function to handle ticket assignments
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
     AND NEW.assigned_to IS NOT NULL THEN
    
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
      assignee.full_name,
      email_subject,
      email_body,
      'created',
      auth.uid()::uuid  -- Cast auth.uid() to UUID explicitly
    );

    -- Send email using edge function
    PERFORM send_email_via_edge_function(
      assignee.email,
      email_subject,
      email_body,
      jsonb_build_object(
        'smtp_host', config.smtp_host,
        'smtp_port', config.smtp_port,
        'smtp_user', config.smtp_user,
        'smtp_password', config.smtp_password,
        'sender_name', config.sender_name,
        'sender_email', config.sender_email,
        'enable_ssl', config.enable_ssl
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER ticket_assignment_notification
  AFTER INSERT OR UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_assignment();

-- Add comment explaining the function
COMMENT ON FUNCTION notify_ticket_assignment() IS 
'Handles ticket assignment notifications by creating email events and sending emails';