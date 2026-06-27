
-- 1) Tighten institutions SELECT policies
DROP POLICY IF EXISTS "Anyone can view institutions by invite code" ON public.institutions;

CREATE POLICY "Members can view their institution"
ON public.institutions
FOR SELECT
TO authenticated
USING (public.is_institution_member(id));

-- 2) Secure invite-code lookup (returns minimal fields)
CREATE OR REPLACE FUNCTION public.lookup_institution_by_invite(_code text)
RETURNS TABLE (id uuid, name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name FROM public.institutions WHERE invite_code = _code LIMIT 1;
$$;

-- 3) Lock down SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_designated_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_institution_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_institution_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_institution_health_stats(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lookup_institution_by_invite(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_designated_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_institution_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_institution_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_institution_health_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_institution_by_invite(text) TO authenticated;
