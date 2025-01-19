-- First disable RLS to allow modifications
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;

-- Drop existing foreign key constraints if they exist
ALTER TABLE public.tickets 
  DROP CONSTRAINT IF EXISTS tickets_created_by_fkey,
  DROP CONSTRAINT IF EXISTS tickets_assigned_to_fkey;

-- Add foreign key constraints with proper references
ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES auth.users(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT tickets_assigned_to_fkey 
    FOREIGN KEY (assigned_to) 
    REFERENCES auth.users(id)
    ON DELETE SET NULL;

-- Re-create the view with proper joins
DROP VIEW IF EXISTS public.ticket_details_view;
CREATE VIEW public.ticket_details_view AS
SELECT 
  t.*,
  c.full_name as created_by_name,
  a.full_name as assigned_to_name
FROM public.tickets t
LEFT JOIN public.user_profiles c ON t.created_by = c.id
LEFT JOIN public.user_profiles a ON t.assigned_to = a.id;

-- Re-enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Re-create RLS policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.tickets;
CREATE POLICY "Allow all operations for authenticated users"
ON public.tickets
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant access to the view
GRANT SELECT ON public.ticket_details_view TO authenticated;