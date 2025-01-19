-- First transaction: Add new enum value
BEGIN;
ALTER TYPE shipment_status_type ADD VALUE IF NOT EXISTS 'submitted';
COMMIT;

-- Add comment explaining the migration
COMMENT ON TYPE shipment_status_type IS 
'Shipment status types including: submitted, sc_approved, reported_to_wh, lo_issued, under_loading, loading_completed, arrived_to_mi_if, departed_mi_if, in_transit, arrived_to_destination';