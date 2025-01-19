-- Drop NOT NULL constraint from status column
ALTER TABLE shipments_updates 
ALTER COLUMN status DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN shipments_updates.status IS 
'Status of the shipment. Null indicates a newly registered shipment pending status assignment.';