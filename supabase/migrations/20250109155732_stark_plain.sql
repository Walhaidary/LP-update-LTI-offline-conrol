-- Add status_changed_at column to tickets table
ALTER TABLE public.tickets
ADD COLUMN status_changed_at timestamptz DEFAULT now();

-- Create function to update status_changed_at
CREATE OR REPLACE FUNCTION update_status_changed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update status_changed_at if status has changed
  IF OLD.status_name IS DISTINCT FROM NEW.status_name THEN
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update status_changed_at
CREATE TRIGGER update_ticket_status_changed_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_status_changed_at();