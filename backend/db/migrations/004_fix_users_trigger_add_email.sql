-- Add email column to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;

-- Backfill email for existing rows from auth.users
UPDATE public.users u
SET email = a.email
FROM auth.users a
WHERE u.id = a.id AND u.email IS NULL;

-- Backfill name for rows that stored email instead of display name
-- (phone is skipped — unique constraint makes bulk backfill unsafe)
UPDATE public.users u
SET name = COALESCE(NULLIF(a.raw_user_meta_data->>'name', ''), a.email)
FROM auth.users a
WHERE u.id = a.id;

-- Fix the trigger function so it reads name/phone from metadata, not email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), NEW.email),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    name  = COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), NEW.email),
    phone = NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    email = NEW.email;
  RETURN NEW;
END;
$$;
