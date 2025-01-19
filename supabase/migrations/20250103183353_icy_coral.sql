/*
  # Create LTI/STO table

  1. New Tables
    - `lti_sto`
      - Composite primary key (lti_number, lti_line)
      - All required fields for LTI/STO tracking
      - Timestamps for auditing

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create the LTI/STO table
CREATE TABLE IF NOT EXISTS public.lti_sto (
  -- Primary key fields
  lti_number text NOT NULL,
  lti_line text NOT NULL,
  
  -- Transporter information
  transporter_name text NOT NULL,
  transporter_code text NOT NULL,
  
  -- LTI details
  lti_date date NOT NULL,
  
  -- Origin information
  origin_co text NOT NULL,
  origin_location text NOT NULL,
  origin_sl_desc text NOT NULL,
  
  -- Destination information
  destination_location text NOT NULL,
  destination_sl text NOT NULL,
  
  -- Additional fields
  frn_cf text,
  consignee text,
  batch_number text,
  commodity_description text,
  
  -- Quantities
  lti_qty_net numeric(10,2) NOT NULL,
  lti_qty_gross numeric(10,2) NOT NULL,
  
  -- TPO information
  tpo_number text,
  
  -- Audit fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  -- Set composite primary key
  PRIMARY KEY (lti_number, lti_line)
);

-- Enable RLS
ALTER TABLE public.lti_sto ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_lti_sto_updated_at
  BEFORE UPDATE ON public.lti_sto
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "Users can view LTI/STO entries"
  ON public.lti_sto
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert LTI/STO entries"
  ON public.lti_sto
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create indexes for better query performance
CREATE INDEX idx_lti_sto_transporter ON public.lti_sto(transporter_name, transporter_code);
CREATE INDEX idx_lti_sto_dates ON public.lti_sto(lti_date);
CREATE INDEX idx_lti_sto_tpo ON public.lti_sto(tpo_number);