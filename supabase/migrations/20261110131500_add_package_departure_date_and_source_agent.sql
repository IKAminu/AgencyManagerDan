ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS departure_date text,
  ADD COLUMN IF NOT EXISTS source_agent text;

ALTER TABLE public.packages
  ALTER COLUMN estimated_cost DROP NOT NULL,
  ALTER COLUMN availability DROP NOT NULL;
