-- First, drop the default value
ALTER TABLE shipments_updates 
ALTER COLUMN status DROP DEFAULT;

-- Then allow null values
ALTER TABLE shipments_updates 
ALTER COLUMN status DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN shipments_updates.status IS 
'Status of the shipment. Can be null for new registrations.';