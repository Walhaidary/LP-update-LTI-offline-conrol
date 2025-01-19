-- Add version column to shipments_updates
ALTER TABLE public.shipments_updates
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1;

-- Create index for version tracking
CREATE INDEX IF NOT EXISTS idx_shipments_updates_version ON public.shipments_updates(serial_number, version);

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_next_version(text) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION get_next_version(text) IS 
'Gets the next version number for a given serial number. Takes p_serial_number as parameter.';