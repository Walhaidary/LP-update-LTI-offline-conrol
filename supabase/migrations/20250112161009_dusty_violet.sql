-- Add version column to shipments_updates
ALTER TABLE public.shipments_updates
ADD COLUMN version integer DEFAULT 1;

-- Create index for version tracking
CREATE INDEX idx_shipments_updates_version ON public.shipments_updates(serial_number, version);

-- Create function to get next version number for a serial number
CREATE OR REPLACE FUNCTION get_next_version(p_serial_number text)
RETURNS integer AS $$
DECLARE
  next_version integer;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1
  INTO next_version
  FROM public.shipments_updates
  WHERE serial_number = p_serial_number;
  
  RETURN next_version;
END;
$$ LANGUAGE plpgsql;