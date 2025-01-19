/*
  # Create shipments_updates table with status tracking
  
  1. New Types
    - `shipment_status_type` enum for tracking shipment statuses
  
  2. New Tables
    - `shipments_updates`
      - All fields from shipments table
      - Additional tracking fields
      - Uses new status enum type
  
  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create enum for shipment status
CREATE TYPE shipment_status_type AS ENUM (
  'reported_to_wh',
  'lo_issued',
  'under_loading',
  'loading_completed',
  'arrived_to_mi_if',
  'departed_mi_if',
  'in_transit',
  'arrived_to_destination'
);

-- Add status column to existing shipments table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipments' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.shipments 
    ADD COLUMN status shipment_status_type DEFAULT 'reported_to_wh';
  END IF;
END $$;

-- Create the shipments_updates table
CREATE TABLE IF NOT EXISTS public.shipments_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE CASCADE,
  pk integer NOT NULL,
  line_number text NOT NULL,
  serial_number text NOT NULL,
  transporter text NOT NULL,
  driver_name text NOT NULL,
  driver_phone text NOT NULL,
  vehicle text NOT NULL,
  values text NOT NULL,
  total numeric DEFAULT 0,
  status shipment_status_type NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipments_updates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view shipment updates"
  ON public.shipments_updates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert shipment updates"
  ON public.shipments_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = updated_by);

-- Create indexes
CREATE INDEX idx_shipments_updates_shipment_id ON public.shipments_updates(shipment_id);
CREATE INDEX idx_shipments_updates_serial_number ON public.shipments_updates(serial_number);
CREATE INDEX idx_shipments_updates_created_at ON public.shipments_updates(created_at);

-- Create trigger function to automatically create update record
CREATE OR REPLACE FUNCTION record_shipment_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.shipments_updates (
      shipment_id,
      pk,
      line_number,
      serial_number,
      transporter,
      driver_name,
      driver_phone,
      vehicle,
      values,
      total,
      status,
      updated_by
    ) VALUES (
      NEW.id,
      NEW.pk,
      NEW.line_number,
      NEW.serial_number,
      NEW.transporter,
      NEW.driver_name,
      NEW.driver_phone,
      NEW.vehicle,
      NEW.values,
      NEW.total,
      NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_shipment_status_update
  AFTER UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION record_shipment_update();