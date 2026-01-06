-- Add popularity column for sorting
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS popularity INTEGER NOT NULL DEFAULT 0;