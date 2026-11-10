-- Add structured departure city and free-form operational notes to travel packages.
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS departure_location text,
  ADD COLUMN IF NOT EXISTS notes text;
