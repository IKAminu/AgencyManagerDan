ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS travel_timing text,
  ADD COLUMN IF NOT EXISTS payment_plan text;
