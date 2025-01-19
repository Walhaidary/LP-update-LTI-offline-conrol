-- Create email_config table
CREATE TABLE IF NOT EXISTS public.email_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host text NOT NULL,
  smtp_port integer NOT NULL,
  smtp_user text NOT NULL,
  smtp_password text NOT NULL,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  enable_ssl boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users can manage email config"
ON public.email_config
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND access_level >= 5
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND access_level >= 5
  )
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users can manage email templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND access_level >= 5
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND access_level >= 5
  )
);

-- Insert default ticket assignment template
INSERT INTO public.email_templates (name, subject, body) VALUES (
  'ticket_assignment',
  'New Ticket Assignment: {{ticket_number}}',
  'Hello {{assignee_name}},

A new ticket has been assigned to you:

Ticket Number: {{ticket_number}}
Title: {{ticket_title}}
Category: {{category}}
Department: {{department}}
Priority: {{priority}}
Due Date: {{due_date}}

You can view the ticket details by logging into the system.

Best regards,
The System'
) ON CONFLICT (name) DO NOTHING;

-- Create function to send test email
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
  -- Send email using pg_notify
  PERFORM pg_notify(
    'test_email',
    json_build_object(
      'to_email', to_email,
      'subject', subject,
      'body', body,
      'smtp_host', smtp_config->>'smtpHost',
      'smtp_port', (smtp_config->>'smtpPort')::integer,
      'smtp_user', smtp_config->>'smtpUser',
      'smtp_password', smtp_config->>'smtpPassword',
      'sender_name', smtp_config->>'senderName',
      'sender_email', smtp_config->>'senderEmail',
      'enable_ssl', (smtp_config->>'enableSSL')::boolean
    )::text
  );
END;
$$;

-- Create function to send email notification
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

    -- Send email using pg_notify
    -- The actual email sending will be handled by an external service
    PERFORM pg_notify(
      'ticket_assignment_email',
      json_build_object(
        'to_email', assignee.email,
        'subject', REPLACE(template.subject, '{{ticket_number}}', NEW.ticket_number),
        'body', email_body,
        'smtp_host', config.smtp_host,
        'smtp_port', config.smtp_port,
        'smtp_user', config.smtp_user,
        'smtp_password', config.smtp_password,
        'sender_name', config.sender_name,
        'sender_email', config.sender_email,
        'enable_ssl', config.enable_ssl
      )::text
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for ticket assignment notifications
DROP TRIGGER IF EXISTS ticket_assignment_notification ON public.tickets;
CREATE TRIGGER ticket_assignment_notification
  AFTER INSERT OR UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_assignment();

-- Add comment explaining the trigger
COMMENT ON FUNCTION notify_ticket_assignment() IS 
'Sends email notification when a ticket is assigned to a user';

-- Add comment explaining the test email function
COMMENT ON FUNCTION send_test_email(text, text, text, jsonb) IS 
'Sends a test email using the provided SMTP configuration';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION send_test_email(text, text, text, jsonb) TO authenticated;