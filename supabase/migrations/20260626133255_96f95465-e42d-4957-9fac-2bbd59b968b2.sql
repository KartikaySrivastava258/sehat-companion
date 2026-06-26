
CREATE POLICY "Users can update their own meal scans" ON public.meal_scans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meal scans" ON public.meal_scans FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own assessments" ON public.assessments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assessments" ON public.assessments FOR DELETE USING (auth.uid() = user_id);
