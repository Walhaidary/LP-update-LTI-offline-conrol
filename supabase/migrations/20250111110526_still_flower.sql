-- Add offline_ticket_approval column to lti_sto table
ALTER TABLE public.lti_sto
ADD COLUMN IF NOT EXISTS offline_ticket_approval text;

-- Create index for offline_ticket_approval
CREATE INDEX IF NOT EXISTS idx_lti_sto_offline_ticket ON public.lti_sto(offline_ticket_approval);

-- Add comment explaining the column
COMMENT ON COLUMN public.lti_sto.offline_ticket_approval IS 
'Reference to the offline approval ticket number';