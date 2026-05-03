-- Route Supabase Auth users into separate app/web profile tables.
--
-- Citizens are stored in public.users.
-- Authority users are stored in public.organization_members.
-- The routing key is auth.users.raw_user_meta_data->>'account_type'.

ALTER TABLE public.organization_members
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

ALTER TABLE public.organization_members
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.organization_members
  ADD CONSTRAINT organization_members_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID;

CREATE UNIQUE INDEX IF NOT EXISTS organization_members_email_unique_idx
ON public.organization_members (email)
WHERE email IS NOT NULL;

ALTER TABLE public.issues
  DROP CONSTRAINT IF EXISTS issues_assigned_to_fkey;

ALTER TABLE public.issues
  ADD CONSTRAINT issues_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.organization_members(id)
  NOT VALID;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  account_type text := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'account_type', ''),
    'citizen'
  );
  member_organization_id uuid := NULLIF(
    NEW.raw_user_meta_data->>'organization_id',
    ''
  )::uuid;
  member_role public.user_role := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'role', '')::public.user_role,
    'citizen'::public.user_role
  );
  display_name text := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  display_phone text := NULLIF(NEW.raw_user_meta_data->>'phone', '');
BEGIN
  IF account_type IN ('organization_member', 'org_member', 'authority') THEN
    IF member_organization_id IS NULL THEN
      RAISE EXCEPTION 'organization_id is required for organization member accounts';
    END IF;

    INSERT INTO public.organization_members (
      id,
      organization_id,
      role,
      name,
      phone,
      email,
      updated_at
    )
    VALUES (
      NEW.id,
      member_organization_id,
      member_role,
      display_name,
      display_phone,
      NEW.email,
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      organization_id = EXCLUDED.organization_id,
      role = EXCLUDED.role,
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      email = EXCLUDED.email,
      updated_at = now();

    DELETE FROM public.users WHERE id = NEW.id;
  ELSE
    INSERT INTO public.users (id, name, phone, email)
    VALUES (NEW.id, display_name, display_phone, NEW.email)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      email = EXCLUDED.email;

    DELETE FROM public.organization_members WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT OR UPDATE OF raw_user_meta_data, email
ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
