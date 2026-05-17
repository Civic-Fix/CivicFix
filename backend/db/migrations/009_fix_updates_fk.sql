-- Fix update record foreign key constraint for auth users.
-- `created_by` should reference auth.users so authority and citizen users can log updates.

ALTER TABLE public.updates
  DROP CONSTRAINT IF EXISTS updates_created_by_fkey;

ALTER TABLE public.updates
  ADD CONSTRAINT updates_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id);
