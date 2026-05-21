alter table public.issues
  add column if not exists category text,
  add column if not exists ai_category_confidence numeric(4, 3),
  add column if not exists ai_severity text,
  add column if not exists ai_summary text,
  add column if not exists ai_tags text[] not null default '{}'::text[],
  add column if not exists ai_duplicate_of uuid references public.issues(id) on delete set null,
  add column if not exists ai_duplicate_score numeric(4, 3),
  add column if not exists ai_duplicate_candidates jsonb not null default '[]'::jsonb,
  add column if not exists ai_analysis jsonb not null default '{}'::jsonb,
  add column if not exists ai_analyzed_at timestamptz;

create index if not exists issues_category_idx
on public.issues (category);

create index if not exists issues_ai_duplicate_of_idx
on public.issues (ai_duplicate_of);

alter table public.issues
  drop constraint if exists issues_ai_severity_check;

alter table public.issues
  add constraint issues_ai_severity_check
  check (
    ai_severity is null
    or ai_severity in ('low', 'medium', 'high', 'critical')
  );
