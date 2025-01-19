-- Create service_providers table
CREATE TABLE IF NOT EXISTS public.service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  vendor_code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('transporter', 'partner', 'other')),
  email text NOT NULL,
  phone text NOT NULL,
  remarks text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view service providers"
  ON public.service_providers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert service providers"
  ON public.service_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND access_level >= 5
    )
  );

-- Create indexes
CREATE INDEX idx_service_providers_name ON public.service_providers(name);
CREATE INDEX idx_service_providers_vendor_code ON public.service_providers(vendor_code);