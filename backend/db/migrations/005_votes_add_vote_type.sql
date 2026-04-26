ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS vote_type text NOT NULL DEFAULT 'upvote'
  CHECK (vote_type IN ('upvote', 'downvote'));

-- Drop the old unique constraint (one vote per issue per user) so a user can have one upvote AND one downvote
-- Instead enforce one vote of each type per user per issue
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_issue_id_user_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS votes_unique_per_type
  ON public.votes (issue_id, user_id, vote_type);
