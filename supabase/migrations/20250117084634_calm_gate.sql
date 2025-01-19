-- Set default value for accountability to null
ALTER TABLE public.tickets 
ALTER COLUMN accountability DROP NOT NULL,
ALTER COLUMN accountability SET DEFAULT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN public.tickets.accountability IS 
'User ID who is accountable for the ticket. Defaults to null.';