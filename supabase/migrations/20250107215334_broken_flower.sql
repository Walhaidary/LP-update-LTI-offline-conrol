-- Re-enable RLS but with a permissive policy
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to view and insert tickets
CREATE POLICY "Allow all operations for authenticated users"
ON public.tickets
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add index for version history queries
CREATE INDEX IF NOT EXISTS idx_tickets_version ON public.tickets(ticket_number, version DESC);