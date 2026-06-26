
-- Function to get anonymous aggregated assessment data for an institution
CREATE OR REPLACE FUNCTION public.get_institution_health_stats(inst_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Verify caller is admin of this institution
  IF NOT EXISTS (
    SELECT 1 FROM public.institutions
    WHERE id = inst_id AND admin_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'total_assessed', COUNT(DISTINCT a.user_id),
    'avg_diabetes_risk', ROUND(AVG(a.diabetes_risk_score)),
    'avg_bp_risk', ROUND(AVG(a.bp_risk_score)),
    'diabetes_high', COUNT(*) FILTER (WHERE a.diabetes_risk_score >= 60),
    'diabetes_moderate', COUNT(*) FILTER (WHERE a.diabetes_risk_score >= 30 AND a.diabetes_risk_score < 60),
    'diabetes_low', COUNT(*) FILTER (WHERE a.diabetes_risk_score < 30),
    'bp_high', COUNT(*) FILTER (WHERE a.bp_risk_score >= 60),
    'bp_moderate', COUNT(*) FILTER (WHERE a.bp_risk_score >= 30 AND a.bp_risk_score < 60),
    'bp_low', COUNT(*) FILTER (WHERE a.bp_risk_score < 30),
    'total_assessments', COUNT(*)
  ) INTO result
  FROM public.assessments a
  INNER JOIN public.institution_members m ON m.user_id = a.user_id
  WHERE m.institution_id = inst_id;

  RETURN result;
END;
$$;
