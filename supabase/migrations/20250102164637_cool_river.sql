/*
  # Add approval date to shipments table

  1. Changes
    - Add approval_date column to shipments table
*/

ALTER TABLE public.shipments 
ADD COLUMN IF NOT EXISTS approval_date timestamptz;