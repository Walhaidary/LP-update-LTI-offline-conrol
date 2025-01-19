-- Remove priority column from categories table
ALTER TABLE public.categories DROP COLUMN IF EXISTS priority;