/*
  # Create shipments table

  1. New Tables
    - `shipments`
      - `id` (uuid, primary key) - Internal unique identifier
      - `pk` (integer, unique) - Excel file PK
      - `line_number` (text) - Line number from Excel
      - `serial_number` (text) - Serial number from Excel
      - `transporter` (text) - Transporter name
      - `driver_name` (text) - Driver's name
      - `driver_phone` (text) - Driver's phone number
      - `vehicle` (text) - Truck plate number
      - `values` (numeric) - Values from Excel
      - `total` (numeric) - Total from Excel
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create the shipments table
CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pk integer UNIQUE NOT NULL,
  line_number text NOT NULL,
  serial_number text NOT NULL,
  transporter text NOT NULL,
  driver_name text NOT NULL,
  driver_phone text NOT NULL,
  vehicle text NOT NULL,
  values numeric DEFAULT 0,
  total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view shipments"
  ON public.shipments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert shipments"
  ON public.shipments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on pk for faster lookups
CREATE INDEX IF NOT EXISTS idx_shipments_pk ON public.shipments(pk);