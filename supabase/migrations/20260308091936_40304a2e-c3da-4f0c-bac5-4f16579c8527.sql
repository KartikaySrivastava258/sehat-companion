
-- Drop existing ALL policy for institutions (it allows any authenticated user to create)
DROP POLICY IF EXISTS "Admins can manage their institutions" ON public.institutions;

-- Create a security definer function to check if user is the designated admin
CREATE OR REPLACE FUNCTION public.is_designated_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND email = 'kartikayadmin@gmail.com'
  );
$$;

-- Only the designated admin can INSERT new institutions
CREATE POLICY "Only designated admin can create institutions"
ON public.institutions FOR INSERT TO authenticated
WITH CHECK (public.is_designated_admin() AND auth.uid() = admin_user_id);

-- The admin of an institution can SELECT their own institutions
CREATE POLICY "Admins can view their institutions"
ON public.institutions FOR SELECT TO authenticated
USING (auth.uid() = admin_user_id);

-- The admin can UPDATE/DELETE their own institutions
CREATE POLICY "Admins can update their institutions"
ON public.institutions FOR UPDATE TO authenticated
USING (auth.uid() = admin_user_id)
WITH CHECK (auth.uid() = admin_user_id);

CREATE POLICY "Admins can delete their institutions"
ON public.institutions FOR DELETE TO authenticated
USING (auth.uid() = admin_user_id);
