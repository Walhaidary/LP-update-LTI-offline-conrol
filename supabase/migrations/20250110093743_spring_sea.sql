-- Create sequence for outbound delivery numbers
CREATE SEQUENCE IF NOT EXISTS obd_number_seq;

-- Add trigger function to auto-generate outbound delivery numbers
CREATE OR REPLACE FUNCTION generate_obd_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate new OBD number with 'OBD-' prefix and 8-digit padded number
  NEW.outbound_delivery_number := 'OBD-' || LPAD(nextval('obd_number_seq')::text, 8, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate OBD number before insert
CREATE TRIGGER set_obd_number
  BEFORE INSERT ON public.obd_waybill
  FOR EACH ROW
  WHEN (NEW.outbound_delivery_number IS NULL)
  EXECUTE FUNCTION generate_obd_number();

-- Add comment explaining the sequence and trigger
COMMENT ON FUNCTION generate_obd_number() IS 
'Generates outbound delivery number with OBD- prefix and 8-digit sequential number';