/*
  # Add status field to shipments table
  
  1. Changes
    - Add status field with enum type for shipment statuses
    - Add default value of 'reported_to_wh'
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create enum type for shipment status
CREATE TYPE shipment_status AS ENUM (
  'reported_to_wh',
  'lo_issued',
  'under_loading',
  'loading_completed',
  'arrived_to_mi_if',
  'departed_mi_if',
  'in_transit',
  'arrived_to_destination'
);

-- Add status column to shipments table
ALTER TABLE shipments 
ADD COLUMN IF NOT EXISTS status shipment_status DEFAULT 'reported_to_wh';