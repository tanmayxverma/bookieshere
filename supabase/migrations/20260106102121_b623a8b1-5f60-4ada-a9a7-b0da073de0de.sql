-- Add badge column to materials table
ALTER TABLE public.materials 
ADD COLUMN badge TEXT CHECK (badge IN ('premium', 'air', 'core') OR badge IS NULL);