-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert tickets" ON public.tickets;

-- Create new insert policy that allows:
-- 1. New tickets (version 1) if user is the creator
-- 2. New versions of existing tickets if user is the creator or assignee
CREATE POLICY "Users can insert tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (
  (version = 1 AND auth.uid() = created_by) OR
  (version > 1 AND EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.ticket_number = ticket_number
    AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
  ))
);

-- Add comment explaining the policy
COMMENT ON POLICY "Users can insert tickets" ON public.tickets IS 
'Allows users to create new tickets or new versions of their existing tickets';