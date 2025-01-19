-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view shipment updates" ON public.shipments_updates;
DROP POLICY IF EXISTS "Users can insert shipment updates" ON public.shipments_updates;

-- Add updated_by column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipments_updates' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE public.shipments_updates 
    ADD COLUMN updated_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create new policies
CREATE POLICY "Users can view shipment updates"
ON public.shipments_updates
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert shipment updates"
ON public.shipments_updates
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = updated_by
);