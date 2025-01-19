-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Users can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert kpis" ON public.kpis;
DROP POLICY IF EXISTS "Users can insert statuses" ON public.statuses;

-- Create new policies that allow admin users to insert records
CREATE POLICY "Admin users can insert departments"
ON public.departments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND access_level >= 5
  )
);

CREATE POLICY "Admin users can insert categories"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND access_level >= 5
  )
);

CREATE POLICY "Admin users can insert kpis"
ON public.kpis FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND access_level >= 5
  )
);

CREATE POLICY "Admin users can insert statuses"
ON public.statuses FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND access_level >= 5
  )
);