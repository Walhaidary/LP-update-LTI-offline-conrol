-- First, create a new enum type with all values in the correct order
CREATE TYPE shipment_status_type_new AS ENUM (
  'submitted',
  'sc_approved',
  'reported_to_wh',
  'lo_issued',
  'under_loading',
  'loading_completed',
  'arrived_to_mi_if',
  'departed_mi_if',
  'in_transit',
  'arrived_to_destination'
);

-- Update the shipments_updates table to use the new type
ALTER TABLE shipments_updates 
  ALTER COLUMN status TYPE shipment_status_type_new 
  USING status::text::shipment_status_type_new;

-- Drop the old type
DROP TYPE shipment_status_type;

-- Rename the new type to the original name
ALTER TYPE shipment_status_type_new RENAME TO shipment_status_type;

-- Add comment explaining the enum
COMMENT ON TYPE shipment_status_type IS 
'Shipment status types in order: submitted, sc_approved, reported_to_wh, lo_issued, under_loading, loading_completed, arrived_to_mi_if, departed_mi_if, in_transit, arrived_to_destination';