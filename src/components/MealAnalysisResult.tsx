import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "./Disclaimer";
import { RefreshCw, Wheat, Droplets, Heart, ArrowRight, Lightbulb } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MealAnalysis {
  mealName: string;
  carbImpact: { level: string; explanation: string };
  saltImpact: { level: string; explanation: string };
  diabetesRelevance: string;
  bpRelevance: string;
  healthierSwaps: { original: string; swap: string; benefit: string }[];
  overallTip: string;
}

interface MealAnalysisResultProps {
  analysis: MealAnalysis;
  onReset: () => void;
}

const getImpactColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "low": return "bg-success/10 text-success border-success/20";
    case "moderate": return "bg-warning/10 text-warning border-warning/20";
    case "high": return "bg-danger/10 text-danger border-danger/20";
    default: return "bg-muted text-muted-foreground";
  }
};

export function MealAnalysisResult({ analysis, onReset }: MealAnalysisResultProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">{analysis.mealName}</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card variant="bordered">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wheat className="w-4 h-4 text-primary" />
              {t("meal.carbImpact")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`mb-2 ${getImpactColor(analysis.carbImpact.level)}`}>{analysis.carbImpact.level}</Badge>
            <p className="text-sm text-muted-foreground">{analysis.carbImpact.explanation}</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Droplets className="w-4 h-4 text-accent" />
              {t("meal.saltImpact")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`mb-2 ${getImpactColor(analysis.saltImpact.level)}`}>{analysis.saltImpact.level}</Badge>
            <p className="text-sm text-muted-foreground">{analysis.saltImpact.explanation}</p>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">{t("meal.healthRelevance")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Droplets className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm mb-1">{t("meal.forDiabetes")}</h4>
              <p className="text-sm text-muted-foreground">{analysis.diabetesRelevance}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm mb-1">{t("meal.forBP")}</h4>
              <p className="text-sm text-muted-foreground">{analysis.bpRelevance}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis.healthierSwaps && analysis.healthierSwaps.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">{t("meal.healthierSwaps")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.healthierSwaps.map((swap, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <span className="text-sm font-medium text-foreground">{swap.original}</span>
                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-primary">{swap.swap}</span>
                  <p className="text-xs text-muted-foreground">{swap.benefit}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {analysis.overallTip && (
        <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">{analysis.overallTip}</p>
        </div>
      )}

      <Disclaimer />

      <div className="text-center">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t("meal.scanAnother")}
        </Button>
      </div>
    </div>
  );
}
