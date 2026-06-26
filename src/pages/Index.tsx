import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AssessmentForm, AssessmentData } from "@/components/AssessmentForm";
import { ResultsSection, RiskAnalysis } from "@/components/ResultsSection";
import { MealScanner } from "@/components/MealScanner";
import { LabReportDecoder } from "@/components/LabReportDecoder";
import { Disclaimer } from "@/components/Disclaimer";

import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

type View = "hero" | "assessment" | "calculating" | "results" | "meal-scanner" | "lab-decoder";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("hero");
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleStartAssessment = () => {
    setCurrentView("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAssessmentSubmit = async (data: AssessmentData) => {
    setAssessmentData(data);
    setCurrentView("calculating");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      // Fetch profile data if user is logged in
      let profileData = null;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, age, gender, city")
          .eq("user_id", user.id)
          .single();
        profileData = profile;
      }

      // Call the AI-powered risk calculation
      const { data: result, error } = await supabase.functions.invoke("calculate-risk", {
        body: { assessmentData: data, profileData },
      });

      if (error) throw error;

      const analysis = result.analysis as RiskAnalysis;
      setRiskAnalysis(analysis);

      // Save assessment to database if user is logged in
      if (user) {
        const insertData = {
          user_id: user.id,
          diabetes_risk_score: analysis.diabetesRisk.score,
          bp_risk_score: analysis.bpRisk.score,
          confidence_level: analysis.diabetesRisk.confidence,
          assessment_data: JSON.parse(JSON.stringify(data)) as Json,
          contributing_factors: {
            modifiable: analysis.modifiableFactors,
            nonModifiable: analysis.nonModifiableFactors,
          } as Json,
          action_plan: analysis.actionPlan as Json,
          explanation: JSON.parse(JSON.stringify(analysis.explanation)) as Json,
        };
        const { error: saveError } = await supabase.from("assessments").insert([insertData] as any);

        if (saveError) {
          console.error("Error saving assessment:", saveError);
        }
      }

      setCurrentView("results");
    } catch (error) {
      console.error("Error calculating risk:", error);
      toast({
        title: "Error",
        description: "Failed to calculate risk assessment. Please try again.",
        variant: "destructive",
      });
      setCurrentView("assessment");
    }
  };

  const handleReset = () => {
    setCurrentView("hero");
    setRiskAnalysis(null);
    setAssessmentData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMealScanner = () => {
    setCurrentView("meal-scanner");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLabDecoder = () => {
    setCurrentView("lab-decoder");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewAssessment = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        toast({
          title: "No assessment found",
          description: "Please take an assessment first.",
          variant: "destructive",
        });
        return;
      }

      const factors = data.contributing_factors as { modifiable?: Array<{ name: string; impact: "high" | "medium" | "low" }>; nonModifiable?: Array<{ name: string; impact: "high" | "medium" | "low" }> } | null;
      const actionPlan = data.action_plan as Array<{ text: string; category: "exercise" | "diet" | "lifestyle" | "monitoring" }> | null;

      const analysis: RiskAnalysis = {
        diabetesRisk: {
          score: data.diabetes_risk_score,
          level: data.diabetes_risk_score < 30 ? "Low" : data.diabetes_risk_score < 60 ? "Moderate" : "High",
          confidence: data.confidence_level,
          comparison: "",
        },
        bpRisk: {
          score: data.bp_risk_score,
          level: data.bp_risk_score < 30 ? "Low" : data.bp_risk_score < 60 ? "Moderate" : "High",
          confidence: data.confidence_level,
          comparison: "",
        },
        explanation: (data as any).explanation || "This is your most recent saved assessment.",
        modifiableFactors: factors?.modifiable || [],
        nonModifiableFactors: factors?.nonModifiable || [],
        actionPlan: actionPlan || [],
      };

      setRiskAnalysis(analysis);
      setAssessmentData(data.assessment_data as unknown as AssessmentData | null);
      setCurrentView("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error("Error loading assessment:", e);
      toast({
        title: "Error",
        description: "Failed to load your latest assessment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {currentView === "hero" && (
          <>
            <HeroSection 
              onStartAssessment={handleStartAssessment} 
              onMealScanner={handleMealScanner}
              onLabDecoder={handleLabDecoder}
              onViewAssessment={handleViewAssessment}
            />
            
            {/* Trust Section */}
            <section className="py-12 border-t border-border/50">
              <div className="container max-w-3xl">
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {t("trust.title")}
                  </h2>
                  <p className="text-muted-foreground">
                    {t("trust.subtitle")}
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <h3 className="font-medium text-foreground mb-1">{t("trust.noDiagnosis")}</h3>
                    <p className="text-sm text-muted-foreground">{t("trust.noDiagnosis.desc")}</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <h3 className="font-medium text-foreground mb-1">{t("trust.noPrescriptions")}</h3>
                    <p className="text-sm text-muted-foreground">{t("trust.noPrescriptions.desc")}</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <h3 className="font-medium text-foreground mb-1">{t("trust.culturallyAware")}</h3>
                    <p className="text-sm text-muted-foreground">{t("trust.culturallyAware.desc")}</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <h3 className="font-medium text-foreground mb-1">{t("trust.doctorRecommended")}</h3>
                    <p className="text-sm text-muted-foreground">{t("trust.doctorRecommended.desc")}</p>
                  </div>
                </div>

                <Disclaimer />
              </div>
            </section>
          </>
        )}

        {currentView === "assessment" && (
          <section className="py-12">
            <div className="container">
              <AssessmentForm onSubmit={handleAssessmentSubmit} />
            </div>
          </section>
        )}

        {currentView === "calculating" && (
          <section className="py-24">
            <div className="container max-w-md text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {t("calculating.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("calculating.subtitle")}
              </p>
            </div>
          </section>
        )}

        {currentView === "results" && riskAnalysis && (
          <ResultsSection analysis={riskAnalysis} onReset={handleReset} stressLevel={assessmentData?.stressLevel} assessmentData={assessmentData} />
        )}

        {currentView === "meal-scanner" && (
          <MealScanner onBack={handleReset} />
        )}

        {currentView === "lab-decoder" && (
          <LabReportDecoder onBack={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            {t("footer.tagline")}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {t("footer.disclaimer")}
          </p>
        </div>
      </footer>

      
    </div>
  );
};

export default Index;
