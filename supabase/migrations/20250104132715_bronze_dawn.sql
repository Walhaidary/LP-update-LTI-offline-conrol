/*
  # Create OBD/Waybill table

  1. New Tables
    - `obd_waybill`
      - `id` (uuid, primary key)
      - `outbound_delivery_number` (text)
      - `outbound_delivery_item_number` (text)
      - `batch_number` (text)
      - `storage_location_name` (text)
      - `material_description` (text)
      - `unit` (text)
      - `mt_net` (numeric)
      - `lti` (text)
      - `driver_name` (text)
      - `driver_license_id` (text)
      - `vehicle_plate` (text)
      - `loading_date` (date)
      - `departure` (text)
      - `destination` (text)
      - `transporter_name` (text)
      - `unloading_point` (text)
      - `frn_cf_number` (text)
      - `remarks` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to view and insert records
*/

-- Create the OBD/Waybill table
CREATE TABLE IF NOT EXISTS public.obd_waybill (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outbound_delivery_number text NOT NULL,
  outbound_delivery_item_number text NOT NULL,
  batch_number text,
  storage_location_name text NOT NULL,
  material_description text NOT NULL,
  unit text NOT NULL,
  mt_net numeric(10,2) NOT NULL,
  lti text,
  driver_name text NOT NULL,
  driver_license_id text NOT NULL,
  vehicle_plate text NOT NULL,
  loading_date date NOT NULL,
  departure text NOT NULL,
  destination text NOT NULL,
  transporter_name text NOT NULL,
  unloading_point text,
  frn_cf_number text,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  -- Create a composite unique constraint
  UNIQUE(outbound_delivery_number, outbound_delivery_item_number)
);

-- Enable RLS
ALTER TABLE public.obd_waybill ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_obd_waybill_updated_at
  BEFORE UPDATE ON public.obd_waybill
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "Users can view OBD/Waybill entries"
  ON public.obd_waybill
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert OBD/Waybill entries"
  ON public.obd_waybill
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create indexes for better query performance
CREATE INDEX idx_obd_waybill_delivery ON public.obd_waybill(outbound_delivery_number, outbound_delivery_item_number);
CREATE INDEX idx_obd_waybill_loading_date ON public.obd_waybill(loading_date);
CREATE INDEX idx_obd_waybill_transporter ON public.obd_waybill(transporter_name);
CREATE INDEX idx_obd_waybill_vehicle ON public.obd_waybill(vehicle_plate);