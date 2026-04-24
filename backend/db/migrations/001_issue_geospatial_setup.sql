create extension if not exists postgis;

alter table public.issues
  add column if not exists address text,
  add column if not exists image_urls jsonb not null default '[]'::jsonb,
  add column if not exists location geography(Point, 4326);

create or replace function public.set_issue_location()
returns trigger
language plpgsql
as $$
begin
  if new.lat is null or new.lng is null then
    new.location := null;
  else
    new.location := ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  end if;

  return new;
end;
$$;

drop trigger if exists issues_set_location on public.issues;

create trigger issues_set_location
before insert or update of lat, lng
on public.issues
for each row
execute function public.set_issue_location();

update public.issues
set location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
where lat is not null
  and lng is not null
  and location is null;

create index if not exists issues_location_gist_idx
on public.issues
using gist (location);

create or replace function public.get_nearby_issues(
  query_lat double precision,
  query_lng double precision,
  radius_meters integer default 5000,
  result_limit integer default 50
)
returns table (
  id uuid,
  title text,
  description text,
  category text,
  status text,
  verification_status text,
  address text,
  lat double precision,
  lng double precision,
  image_urls jsonb,
  created_at timestamptz,
  distance_meters double precision
)
language sql
stable
as $$
  select
    issues.id,
    issues.title,
    issues.description,
    issues.category,
    issues.status,
    issues.verification_status,
    issues.address,
    issues.lat,
    issues.lng,
    issues.image_urls,
    issues.created_at,
    ST_Distance(
      issues.location,
      ST_SetSRID(ST_MakePoint(query_lng, query_lat), 4326)::geography
    ) as distance_meters
  from public.issues
  where issues.location is not null
    and ST_DWithin(
      issues.location,
      ST_SetSRID(ST_MakePoint(query_lng, query_lat), 4326)::geography,
      radius_meters
    )
  order by distance_meters asc, issues.created_at desc
  limit result_limit;
$$;
