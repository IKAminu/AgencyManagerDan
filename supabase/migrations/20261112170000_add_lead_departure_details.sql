ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS preferred_departure_date date,
  ADD COLUMN IF NOT EXISTS departure_location text,
  ADD COLUMN IF NOT EXISTS state text;
