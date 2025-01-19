-- Add assigned_to column to tickets table
ALTER TABLE public.tickets
ADD COLUMN assigned_to uuid REFERENCES auth.users(id);

-- Create index for assigned_to column
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);