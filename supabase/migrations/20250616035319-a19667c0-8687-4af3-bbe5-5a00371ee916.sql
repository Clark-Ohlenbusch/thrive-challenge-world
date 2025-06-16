
-- Create enums
CREATE TYPE plan_tier AS ENUM ('free', 'pro');
CREATE TYPE challenge_frequency AS ENUM ('daily', 'weekly');

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  plan_tier plan_tier NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  frequency challenge_frequency NOT NULL DEFAULT 'daily',
  unit_label TEXT,
  goal_numeric INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create memberships table
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_checkin DATE,
  streak INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, challenge_id)
);

-- Create entries table
CREATE TABLE public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  value_numeric INTEGER,
  note TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(membership_id, entry_date)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- Create invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (id = auth.uid());

-- RLS Policies for challenges table
CREATE POLICY "Anyone can view public challenges" ON public.challenges FOR SELECT USING (is_public = true);
CREATE POLICY "Members can view private challenges" ON public.challenges FOR SELECT USING (
  NOT is_public AND EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE challenge_id = challenges.id AND user_id = auth.uid()
  )
);
CREATE POLICY "Owners can view their challenges" ON public.challenges FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create challenges" ON public.challenges FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their challenges" ON public.challenges FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete their challenges" ON public.challenges FOR DELETE USING (owner_id = auth.uid());

-- RLS Policies for memberships table
CREATE POLICY "Users can view memberships of accessible challenges" ON public.memberships FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.challenges c 
    WHERE c.id = challenge_id AND (
      c.is_public = true OR 
      c.owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.memberships m2 WHERE m2.challenge_id = c.id AND m2.user_id = auth.uid())
    )
  )
);
CREATE POLICY "Users can create their own memberships" ON public.memberships FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own memberships" ON public.memberships FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own memberships" ON public.memberships FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for entries table
CREATE POLICY "Users can view entries of accessible challenges" ON public.entries FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    JOIN public.challenges c ON c.id = m.challenge_id
    WHERE m.id = membership_id AND (
      c.is_public = true OR 
      c.owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.memberships m2 WHERE m2.challenge_id = c.id AND m2.user_id = auth.uid())
    )
  )
);
CREATE POLICY "Users can create entries for their memberships" ON public.entries FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE id = membership_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can update their own entries" ON public.entries FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE id = membership_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete their own entries" ON public.entries FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE id = membership_id AND user_id = auth.uid()
  )
);

-- RLS Policies for comments table
CREATE POLICY "Users can view comments on accessible challenges" ON public.comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.challenges c 
    WHERE c.id = challenge_id AND (
      c.is_public = true OR 
      c.owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.memberships m WHERE m.challenge_id = c.id AND m.user_id = auth.uid())
    )
  )
);
CREATE POLICY "Users can create comments on accessible challenges" ON public.comments FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.challenges c 
    WHERE c.id = challenge_id AND (
      c.is_public = true OR 
      c.owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.memberships m WHERE m.challenge_id = c.id AND m.user_id = auth.uid())
    )
  )
);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for likes table
CREATE POLICY "Users can view likes on accessible comments" ON public.likes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.comments co
    JOIN public.challenges c ON c.id = co.challenge_id
    WHERE co.id = comment_id AND (
      c.is_public = true OR 
      c.owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.memberships m WHERE m.challenge_id = c.id AND m.user_id = auth.uid())
    )
  )
);
CREATE POLICY "Users can create their own likes" ON public.likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for invites table
CREATE POLICY "Challenge owners can view invites for their challenges" ON public.invites FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.challenges 
    WHERE id = challenge_id AND owner_id = auth.uid()
  )
);
CREATE POLICY "Invitees can view their own invites" ON public.invites FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND email = invites.email
  )
);
CREATE POLICY "Challenge owners can create invites" ON public.invites FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.challenges 
    WHERE id = challenge_id AND owner_id = auth.uid()
  )
);
CREATE POLICY "Challenge owners can update invites" ON public.invites FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.challenges 
    WHERE id = challenge_id AND owner_id = auth.uid()
  )
);

-- Create storage bucket for challenge photos
INSERT INTO storage.buckets (id, name, public) VALUES ('challenge-photos', 'challenge-photos', true);

-- Storage policies for challenge photos
CREATE POLICY "Anyone can view challenge photos" ON storage.objects FOR SELECT USING (bucket_id = 'challenge-photos');
CREATE POLICY "Authenticated users can upload challenge photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'challenge-photos' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Users can update their own photos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'challenge-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete their own photos" ON storage.objects FOR DELETE USING (
  bucket_id = 'challenge-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
