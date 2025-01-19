-- Temporarily disable RLS on tickets table
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;

-- Drop existing policies since they won't be used
DROP POLICY IF EXISTS "Users can view tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can insert tickets" ON public.tickets;