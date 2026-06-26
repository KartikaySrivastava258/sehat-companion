
-- Institutions table
CREATE TABLE public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'college',
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Institution members table
CREATE TABLE public.institution_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  department TEXT,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(institution_id, user_id)
);

-- RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;

-- Institution policies
CREATE POLICY "Admins can manage their institutions"
  ON public.institutions FOR ALL
  USING (auth.uid() = admin_user_id)
  WITH CHECK (auth.uid() = admin_user_id);

CREATE POLICY "Members can view their institution"
  ON public.institutions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_members.institution_id = institutions.id
      AND institution_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view institutions by invite code"
  ON public.institutions FOR SELECT
  USING (true);

-- Member policies
CREATE POLICY "Admins can view members of their institution"
  ON public.institution_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.institutions
      WHERE institutions.id = institution_members.institution_id
      AND institutions.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join institutions"
  ON public.institution_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own membership"
  ON public.institution_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave institutions"
  ON public.institution_members FOR DELETE
  USING (auth.uid() = user_id);
