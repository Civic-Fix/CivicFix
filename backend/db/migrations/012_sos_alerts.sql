create extension if not exists postgis;

create table if not exists public.sos_alerts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  lat double precision not null check (lat >= -90 and lat <= 90),
  lng double precision not null check (lng >= -180 and lng <= 180),
  locality text,
  address text,
  created_at timestamptz not null default now()
);

create index if not exists sos_alerts_created_at_idx
  on public.sos_alerts (created_at desc);

create index if not exists sos_alerts_location_idx
  on public.sos_alerts using gist (
    (st_setsrid(st_makepoint(lng, lat), 4326)::geography)
  );

alter table public.sos_alerts enable row level security;

drop policy if exists "Authenticated users can view SOS alerts" on public.sos_alerts;
create policy "Authenticated users can view SOS alerts"
  on public.sos_alerts for select
  to authenticated
  using (true);

drop policy if exists "Users can create SOS alerts" on public.sos_alerts;
create policy "Users can create SOS alerts"
  on public.sos_alerts for insert
  to authenticated
  with check (auth.uid() = created_by);
