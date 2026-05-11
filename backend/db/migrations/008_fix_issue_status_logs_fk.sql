-- Fix issue status logging foreign key constraints for auth users.
-- `changed_by` should reference auth.users so organization members can log status changes.

ALTER TABLE public.issue_status_logs
  DROP CONSTRAINT IF EXISTS issue_status_logs_changed_by_fkey;

ALTER TABLE public.issue_status_logs
  ADD CONSTRAINT issue_status_logs_changed_by_fkey
  FOREIGN KEY (changed_by) REFERENCES auth.users(id);

ALTER TABLE public.issue_verifications
  DROP CONSTRAINT IF EXISTS issue_verifications_user_id_fkey;

ALTER TABLE public.issue_verifications
  ADD CONSTRAINT issue_verifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id);
