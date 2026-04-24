create unique index if not exists votes_issue_user_unique_idx
on public.votes (issue_id, user_id);
