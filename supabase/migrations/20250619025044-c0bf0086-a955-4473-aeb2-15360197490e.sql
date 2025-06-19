
-- First, drop all foreign key constraints that reference the columns we need to change
ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS challenges_owner_id_fkey;
ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_user_id_fkey;
ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_challenge_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_challenge_id_fkey;
ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_membership_id_fkey;
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_inviter_id_fkey;
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_challenge_id_fkey;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_comment_id_fkey;

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Anyone can view public challenges" ON public.challenges;
DROP POLICY IF EXISTS "Members can view private challenges" ON public.challenges;
DROP POLICY IF EXISTS "Owners can view their challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON public.challenges;
DROP POLICY IF EXISTS "Owners can update their challenges" ON public.challenges;
DROP POLICY IF EXISTS "Owners can delete their challenges" ON public.challenges;

DROP POLICY IF EXISTS "Users can view memberships of accessible challenges" ON public.memberships;
DROP POLICY IF EXISTS "Users can create their own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON public.memberships;

DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

DROP POLICY IF EXISTS "Users can view comments on accessible challenges" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments on accessible challenges" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

DROP POLICY IF EXISTS "Users can view entries of accessible challenges" ON public.entries;
DROP POLICY IF EXISTS "Users can create entries for their memberships" ON public.entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON public.entries;

DROP POLICY IF EXISTS "Users can view likes on accessible comments" ON public.likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;

DROP POLICY IF EXISTS "Challenge owners can view invites for their challenges" ON public.invites;
DROP POLICY IF EXISTS "Invitees can view their own invites" ON public.invites;
DROP POLICY IF EXISTS "Challenge owners can create invites" ON public.invites;
DROP POLICY IF EXISTS "Challenge owners can update invites" ON public.invites;

-- Now update the column types from UUID to text
ALTER TABLE public.users ALTER COLUMN id TYPE text;
ALTER TABLE public.challenges ALTER COLUMN id TYPE text;
ALTER TABLE public.challenges ALTER COLUMN owner_id TYPE text;
ALTER TABLE public.memberships ALTER COLUMN id TYPE text;
ALTER TABLE public.memberships ALTER COLUMN user_id TYPE text;
ALTER TABLE public.memberships ALTER COLUMN challenge_id TYPE text;
ALTER TABLE public.comments ALTER COLUMN id TYPE text;
ALTER TABLE public.comments ALTER COLUMN user_id TYPE text;
ALTER TABLE public.comments ALTER COLUMN challenge_id TYPE text;
ALTER TABLE public.entries ALTER COLUMN id TYPE text;
ALTER TABLE public.entries ALTER COLUMN membership_id TYPE text;
ALTER TABLE public.invites ALTER COLUMN id TYPE text;
ALTER TABLE public.invites ALTER COLUMN challenge_id TYPE text;
ALTER TABLE public.invites ALTER COLUMN inviter_id TYPE text;
ALTER TABLE public.likes ALTER COLUMN id TYPE text;
ALTER TABLE public.likes ALTER COLUMN user_id TYPE text;
ALTER TABLE public.likes ALTER COLUMN comment_id TYPE text;

-- Recreate foreign key constraints with text types
ALTER TABLE public.challenges ADD CONSTRAINT challenges_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.memberships ADD CONSTRAINT memberships_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.memberships ADD CONSTRAINT memberships_challenge_id_fkey 
  FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;

ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.comments ADD CONSTRAINT comments_challenge_id_fkey 
  FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;

ALTER TABLE public.entries ADD CONSTRAINT entries_membership_id_fkey 
  FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;

ALTER TABLE public.invites ADD CONSTRAINT invites_inviter_id_fkey 
  FOREIGN KEY (inviter_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.invites ADD CONSTRAINT invites_challenge_id_fkey 
  FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;

ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.likes ADD CONSTRAINT likes_comment_id_fkey 
  FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;

-- Recreate RLS policies that work with Clerk authentication
-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Users can update their own profile" ON public.users  
FOR UPDATE USING (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Users can insert their own profile" ON public.users
FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = id);

-- Challenges table policies
CREATE POLICY "Users can view public challenges" ON public.challenges
FOR SELECT USING (is_public = true OR auth.jwt() ->> 'sub' = owner_id);

CREATE POLICY "Users can create challenges" ON public.challenges
FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = owner_id);

CREATE POLICY "Users can update their own challenges" ON public.challenges
FOR UPDATE USING (auth.jwt() ->> 'sub' = owner_id);

-- Memberships table policies
CREATE POLICY "Users can view their own memberships" ON public.memberships
FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own memberships" ON public.memberships
FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own memberships" ON public.memberships
FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

-- Comments policies
CREATE POLICY "Users can view all comments" ON public.comments
FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.comments
FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

-- Entries policies  
CREATE POLICY "Users can view all entries" ON public.entries
FOR SELECT USING (true);

CREATE POLICY "Users can create entries" ON public.entries
FOR INSERT WITH CHECK (true);

-- Invites policies
CREATE POLICY "Users can view invites they sent" ON public.invites
FOR SELECT USING (auth.jwt() ->> 'sub' = inviter_id);

CREATE POLICY "Users can create invites" ON public.invites
FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = inviter_id);

-- Likes policies
CREATE POLICY "Users can view all likes" ON public.likes
FOR SELECT USING (true);

CREATE POLICY "Users can create likes" ON public.likes
FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own likes" ON public.likes
FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);
