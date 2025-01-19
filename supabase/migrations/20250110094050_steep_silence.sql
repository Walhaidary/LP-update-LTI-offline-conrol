-- First drop the trigger that depends on outbound_delivery_number
DROP TRIGGER IF EXISTS set_obd_number ON public.obd_waybill;
DROP FUNCTION IF EXISTS generate_obd_number;

-- Now we can safely modify the columns
ALTER TABLE public.obd_waybill
  ALTER COLUMN outbound_delivery_number TYPE text,
  ALTER COLUMN outbound_delivery_item_number TYPE text,
  ALTER COLUMN mt_net TYPE numeric(10,2);

-- Add NOT NULL constraints where appropriate
ALTER TABLE public.obd_waybill
  ALTER COLUMN outbound_delivery_item_number SET NOT NULL,
  ALTER COLUMN storage_location_name SET NOT NULL,
  ALTER COLUMN material_description SET NOT NULL,
  ALTER COLUMN unit SET NOT NULL,
  ALTER COLUMN mt_net SET NOT NULL,
  ALTER COLUMN driver_name SET NOT NULL,
  ALTER COLUMN vehicle_plate SET NOT NULL,
  ALTER COLUMN loading_date SET NOT NULL,
  ALTER COLUMN departure SET NOT NULL,
  ALTER COLUMN destination SET NOT NULL,
  ALTER COLUMN transporter_name SET NOT NULL;

-- Add default values where appropriate
ALTER TABLE public.obd_waybill
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN unit SET DEFAULT 'MT';

-- Recreate the function for generating OBD numbers
CREATE OR REPLACE FUNCTION generate_obd_number()
RETURNS TRIGGER AS $$
DECLARE
  new_number text;
BEGIN
  -- Generate new OBD number
  SELECT 'OBD-' || LPAD(nextval('obd_number_seq')::text, 6, '0')
  INTO new_number;
  
  -- Set the OBD number
  NEW.outbound_delivery_number := new_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER set_obd_number
  BEFORE INSERT ON public.obd_waybill
  FOR EACH ROW
  WHEN (NEW.outbound_delivery_number IS NULL)
  EXECUTE FUNCTION generate_obd_number();