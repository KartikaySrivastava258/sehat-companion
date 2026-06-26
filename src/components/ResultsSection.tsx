import { RiskScoreCard } from "./RiskScoreCard";
import { ContributingFactors } from "./ContributingFactors";
import { ActionPlan } from "./ActionPlan";
import { Disclaimer } from "./Disclaimer";
import { RootedWellnessSection } from "./RootedWellnessSection";
import { Button } from "@/components/ui/button";
import { Droplets, Heart, RefreshCw, ShieldCheck, AlertTriangle, TrendingDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AssessmentData } from "./AssessmentForm";

interface ExplanationDetail {
  summary: string;
  diabetesReasons: string[];
  bpReasons: string[];
  protectiveFactors: string[];
}

export interface RiskAnalysis {
  diabetesRisk: {
    score: number;
    level: string;
    confidence: string;
    comparison: string;
  };
  bpRisk: {
    score: number;
    level: string;
    confidence: string;
    comparison: string;
  };
  explanation: string | ExplanationDetail;
  modifiableFactors: Array<{ name: string; impact: "high" | "medium" | "low" }>;
  nonModifiableFactors: Array<{ name: string; impact: "high" | "medium" | "low" }>;
  actionPlan: Array<{ text: string; category: "exercise" | "diet" | "lifestyle" | "monitoring" }>;
}

interface ResultsSectionProps {
  analysis: RiskAnalysis;
  onReset: () => void;
  stressLevel?: string;
  assessmentData?: AssessmentData | null;
}

function isDetailedExplanation(exp: string | ExplanationDetail): exp is ExplanationDetail {
  return typeof exp === "object" && exp !== null && "summary" in exp;
}

export function ResultsSection({ analysis, onReset, stressLevel, assessmentData }: ResultsSectionProps) {
  const { t } = useLanguage();
  const detailed = isDetailedExplanation(analysis.explanation);

  return (
    <section className="py-12">
      <div className="container max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            {t("results.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("results.subtitle")}
          </p>
        </div>

        <div className="mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <Disclaimer />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <RiskScoreCard
            title={t("results.diabetes")}
            score={analysis.diabetesRisk.score}
            confidence={analysis.diabetesRisk.confidence}
            comparison={analysis.diabetesRisk.comparison}
            icon={<Droplets className="w-5 h-5 text-primary" />}
            delay={200}
          />
          <RiskScoreCard
            title={t("results.bp")}
            score={analysis.bpRisk.score}
            confidence={analysis.bpRisk.confidence}
            comparison={analysis.bpRisk.comparison}
            icon={<Heart className="w-5 h-5 text-accent" />}
            delay={300}
          />
        </div>

        <div className="bg-secondary/50 rounded-2xl p-6 mb-8 animate-fade-in" style={{ animationDelay: "350ms" }}>
          <h3 className="font-display font-semibold text-xl text-foreground mb-4">
            {t("results.whyScores")}
          </h3>

          {detailed ? (
            <div className="space-y-5">
              <p className="text-foreground leading-relaxed text-base">
                {(analysis.explanation as ExplanationDetail).summary}
              </p>

              {(analysis.explanation as ExplanationDetail).diabetesReasons?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm text-primary uppercase tracking-wide">{t("results.diabetesFactors")}</h4>
                  </div>
                  <ul className="space-y-2">
                    {(analysis.explanation as ExplanationDetail).diabetesReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed">
                        <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(analysis.explanation as ExplanationDetail).bpReasons?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-accent" />
                    <h4 className="font-semibold text-sm text-accent uppercase tracking-wide">{t("results.bpFactors")}</h4>
                  </div>
                  <ul className="space-y-2">
                    {(analysis.explanation as ExplanationDetail).bpReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed">
                        <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(analysis.explanation as ExplanationDetail).protectiveFactors?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    <h4 className="font-semibold text-sm text-success uppercase tracking-wide">{t("results.doingRight")}</h4>
                  </div>
                  <ul className="space-y-2">
                    {(analysis.explanation as ExplanationDetail).protectiveFactors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed">
                        <TrendingDown className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-muted-foreground italic mt-3 border-t border-border pt-3">
                {t("results.explanationNote")}
              </p>
            </div>
          ) : (
            <p className="text-foreground leading-relaxed">
              {analysis.explanation as string}
            </p>
          )}
        </div>

        <div className="mb-8">
          <ContributingFactors 
            modifiable={analysis.modifiableFactors} 
            nonModifiable={analysis.nonModifiableFactors} 
          />
        </div>

        <div className="mb-8">
          <ActionPlan actions={analysis.actionPlan} />
        </div>

        {assessmentData && (
          <div className="mb-8">
            <RootedWellnessSection
              assessmentData={assessmentData}
              riskAnalysis={analysis}
            />
          </div>
        )}

        <div className="mb-8">
          <Disclaimer />
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("results.takeAgain")}
          </Button>
        </div>
      </div>
    </section>
  );
}
