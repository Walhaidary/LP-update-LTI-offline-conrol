/*
  # Add SC Approved status to shipment status
  
  1. Changes
    - Add 'sc_approved' to shipment_status_type enum
    - Set 'sc_approved' as default status for shipments table
  
  2. Security
    - No changes to RLS policies needed
*/

-- First transaction: Add new enum value
BEGIN;
ALTER TYPE shipment_status_type ADD VALUE IF NOT EXISTS 'sc_approved';
COMMIT;

-- Second transaction: Set default value
BEGIN;
ALTER TABLE public.shipments 
  ALTER COLUMN status SET DEFAULT 'sc_approved'::shipment_status_type;
COMMIT;