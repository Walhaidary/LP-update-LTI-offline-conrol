-- Create function to send email via edge function
CREATE OR REPLACE FUNCTION send_email_via_edge_function(
  to_email text,
  subject text,
  body text,
  smtp_config jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  edge_function_url text;
BEGIN
  -- Get edge function URL from database settings
  SELECT current_setting('app.settings.edge_function_url', true) INTO edge_function_url;
  
  -- If URL is not set, raise an error
  IF edge_function_url IS NULL THEN
    RAISE EXCEPTION 'Edge function URL is not configured';
  END IF;

  -- Make HTTP request to edge function
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'to_email', to_email,
      'subject', subject,
      'body', body,
      'smtp_config', smtp_config
    )
  );
END;
$$;

-- Update send_test_email function to use edge function
CREATE OR REPLACE FUNCTION send_test_email(
  to_email text,
  subject text,
  body text,
  smtp_config jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM send_email_via_edge_function(
    to_email,
    subject,
    body,
    smtp_config
  );
END;
$$;

-- Update notify_ticket_assignment function to use edge function
CREATE OR REPLACE FUNCTION notify_ticket_assignment()
RETURNS TRIGGER AS $$
DECLARE
  config public.email_config%ROWTYPE;
  template public.email_templates%ROWTYPE;
  assignee public.user_profiles%ROWTYPE;
  email_body text;
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

    -- Send email using edge function
    PERFORM send_email_via_edge_function(
      assignee.email,
      REPLACE(template.subject, '{{ticket_number}}', NEW.ticket_number),
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