-- Drop existing trigger and sequence first
DROP TRIGGER IF EXISTS set_obd_number ON public.obd_waybill;
DROP FUNCTION IF EXISTS generate_obd_number;
DROP SEQUENCE IF EXISTS obd_number_seq;

-- Create new sequence for outbound delivery numbers
CREATE SEQUENCE obd_number_seq;

-- Create improved function to generate OFL numbers
CREATE OR REPLACE FUNCTION generate_obd_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate new OFL number with 8-digit padded number
  NEW.outbound_delivery_number := 'OFL-' || LPAD(nextval('obd_number_seq')::text, 8, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER set_obd_number
  BEFORE INSERT ON public.obd_waybill
  FOR EACH ROW
  WHEN (NEW.outbound_delivery_number IS NULL)
  EXECUTE FUNCTION generate_obd_number();

-- Add comment explaining the function
COMMENT ON FUNCTION generate_obd_number() IS 
'Generates outbound delivery number with OFL- prefix and 8-digit sequential number';