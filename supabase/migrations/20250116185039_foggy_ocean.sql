-- Add vendor_code column to shipments_updates table
ALTER TABLE public.shipments_updates
ADD COLUMN vendor_code text;

-- Create index for vendor_code
CREATE INDEX idx_shipments_updates_vendor_code ON public.shipments_updates(vendor_code);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view shipment updates" ON public.shipments_updates;
DROP POLICY IF EXISTS "Users can insert shipment updates" ON public.shipments_updates;

-- Create new RLS policies that consider vendor_code
CREATE POLICY "Users can view shipment updates"
ON public.shipments_updates
FOR SELECT
TO authenticated
USING (
  updated_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.vendor_code IS NOT NULL
    AND up.vendor_code = vendor_code
  )
);

CREATE POLICY "Users can insert shipment updates"
ON public.shipments_updates
FOR INSERT
TO authenticated
WITH CHECK (
  updated_by = auth.uid()
);

-- Add comment explaining the changes
COMMENT ON COLUMN public.shipments_updates.vendor_code IS 
'Vendor code to enable shared access between users from the same vendor';