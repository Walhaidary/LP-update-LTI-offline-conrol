-- Update the default value for the status column
ALTER TABLE shipments_updates 
ALTER COLUMN status SET DEFAULT 'submitted'::shipment_status_type;

-- Add comment explaining the change
COMMENT ON COLUMN shipments_updates.status IS 
'Status of the shipment. Defaults to submitted.';