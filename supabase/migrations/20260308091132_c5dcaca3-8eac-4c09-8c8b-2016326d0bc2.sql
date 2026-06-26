
-- Drop all existing policies on institutions and institution_members
DROP POLICY IF EXISTS "Admins can manage their institutions" ON public.institutions;
DROP POLICY IF EXISTS "Anyone can view institutions by invite code" ON public.institutions;
DROP POLICY IF EXISTS "Members can view their institution" ON public.institutions;
DROP POLICY IF EXISTS "Admins can view members of their institution" ON public.institution_members;
DROP POLICY IF EXISTS "Users can join institutions" ON public.institution_members;
DROP POLICY IF EXISTS "Users can leave institutions" ON public.institution_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.institution_members;

-- Create security definer helper functions to break recursion
CREATE OR REPLACE FUNCTION public.is_institution_admin(_inst_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.institutions
    WHERE id = _inst_id AND admin_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_institution_member(_inst_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.institution_members
    WHERE institution_id = _inst_id AND user_id = auth.uid()
  );
$$;

-- Institutions policies (no cross-table queries)
CREATE POLICY "Admins can manage their institutions"
ON public.institutions FOR ALL TO authenticated
USING (auth.uid() = admin_user_id)
WITH CHECK (auth.uid() = admin_user_id);

CREATE POLICY "Anyone can view institutions by invite code"
ON public.institutions FOR SELECT TO authenticated
USING (true);

-- Institution members policies (use security definer functions)
CREATE POLICY "Users can view their own membership"
ON public.institution_members FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view members of their institution"
ON public.institution_members FOR SELECT TO authenticated
USING (public.is_institution_admin(institution_id));

CREATE POLICY "Users can join institutions"
ON public.institution_members FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave institutions"
ON public.institution_members FOR DELETE TO authenticated
USING (auth.uid() = user_id);
