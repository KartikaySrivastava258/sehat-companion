import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Activity, Utensils, FileText, LayoutDashboard, AlertCircle, Building2, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  onStartAssessment: () => void;
  onMealScanner: () => void;
  onLabDecoder: () => void;
  onViewAssessment: () => void;
}

interface LatestAssessment {
  diabetes_risk_score: number;
  bp_risk_score: number;
  created_at: string;
}

export function HeroSection({ onStartAssessment, onMealScanner, onLabDecoder, onViewAssessment }: HeroSectionProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [latestAssessment, setLatestAssessment] = useState<LatestAssessment | null>(null);
  const [hasAssessment, setHasAssessment] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchLatestAssessment = async () => {
      if (!user) {
        setHasAssessment(false);
        return;
      }

      const { data, error } = await supabase
        .from("assessments")
        .select("diabetes_risk_score, bp_risk_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setLatestAssessment(data);
        setHasAssessment(true);
      } else {
        setHasAssessment(false);
      }
    };

    fetchLatestAssessment();
  }, [user]);

  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: t("results.low"), color: "text-success" };
    if (score < 50) return { label: t("results.moderate"), color: "text-warning" };
    if (score < 70) return { label: t("results.moderate"), color: "text-orange-500" };
    return { label: t("results.high"), color: "text-destructive" };
  };

  const handleActionPlansClick = () => {
    if (hasAssessment) {
      navigate("/dashboard");
    } else {
      onStartAssessment();
    }
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-foreground mb-6 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>{t("hero.aiPowered")}</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in text-balance" style={{ animationDelay: "100ms" }}>
            {t("hero.title")}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: "200ms" }}>
            {t("hero.subtitle")}
          </p>

          {user && hasAssessment && latestAssessment && (
            <div className="mb-8 p-4 bg-card border border-border rounded-xl animate-fade-in" style={{ animationDelay: "250ms" }}>
              <p className="text-sm text-muted-foreground mb-3">{t("hero.latestAssessment")}</p>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    <span className={getRiskLevel(latestAssessment.diabetes_risk_score).color}>
                      {latestAssessment.diabetes_risk_score}%
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{t("hero.diabetesRisk")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    <span className={getRiskLevel(latestAssessment.bp_risk_score).color}>
                      {latestAssessment.bp_risk_score}%
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{t("hero.bpRisk")}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 gap-2"
                onClick={() => navigate("/dashboard")}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t("hero.viewDashboard")}
              </Button>
            </div>
          )}

          {user && hasAssessment === false && (
            <div className="mb-8 p-4 bg-muted/50 border border-border rounded-xl animate-fade-in flex items-center justify-center gap-3" style={{ animationDelay: "250ms" }}>
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("hero.noAssessmentPrompt")}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Button size="xl" variant="hero" onClick={onStartAssessment} className="gap-2">
              {hasAssessment ? t("hero.retakeAssessment") : t("hero.startAssessment")}
              <ArrowRight className="w-5 h-5" />
            </Button>
            {user && hasAssessment && (
              <Button size="xl" variant="outline" onClick={onViewAssessment} className="gap-2">
                <Eye className="w-5 h-5" />
                {t("hero.viewAssessment")}
              </Button>
            )}
            {user && (
              <Button size="xl" variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
                <LayoutDashboard className="w-5 h-5" />
                {t("hero.goToDashboard")}
              </Button>
            )}
          </div>

          {user && (
            <div className="flex justify-center mb-12 animate-fade-in" style={{ animationDelay: "350ms" }}>
              <Button size="xl" variant="outline" onClick={() => navigate("/institution")} className="gap-2">
                <Building2 className="w-5 h-5" />
                {t("hero.institutionDashboard")}
              </Button>
            </div>
          )}

          <div className="grid sm:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="flex flex-col items-center gap-2 p-4 cursor-pointer rounded-xl hover:bg-primary/5 transition-colors" onClick={onStartAssessment}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground text-sm">{t("feature.riskAssessment")}</h3>
              <p className="text-xs text-muted-foreground">{t("feature.riskAssessment.desc")}</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 cursor-pointer rounded-xl hover:bg-accent/5 transition-colors" onClick={onMealScanner}>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-medium text-foreground text-sm">{t("feature.mealScanner")}</h3>
              <p className="text-xs text-muted-foreground">{t("feature.mealScanner.desc")}</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 cursor-pointer rounded-xl hover:bg-warning/5 transition-colors" onClick={onLabDecoder}>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-medium text-foreground text-sm">{t("feature.labDecoder")}</h3>
              <p className="text-xs text-muted-foreground">{t("feature.labDecoder.desc")}</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 cursor-pointer rounded-xl hover:bg-success/5 transition-colors" onClick={handleActionPlansClick}>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-medium text-foreground text-sm">{t("hero.actionPlans")}</h3>
              <p className="text-xs text-muted-foreground">
                {hasAssessment ? t("hero.viewTasks") : t("hero.takeTestFirst")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
