import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Factor { name: string; impact: "high" | "medium" | "low"; }
interface ContributingFactorsProps { modifiable: Factor[]; nonModifiable: Factor[]; }

export function ContributingFactors({ modifiable, nonModifiable }: ContributingFactorsProps) {
  const { t } = useLanguage();
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-danger/10 text-danger";
      case "medium": return "bg-warning/10 text-warning";
      case "low": return "bg-success/10 text-success";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card variant="elevated" className="animate-fade-in" style={{ animationDelay: "400ms" }}>
      <CardHeader><CardTitle className="text-xl">{t("factors.title")}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <h4 className="font-medium text-foreground">{t("factors.modifiable")}</h4>
          </div>
          <div className="space-y-2">
            {modifiable.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-foreground">{factor.name}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getImpactColor(factor.impact)}`}>
                  {factor.impact} {t("factors.impact")}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-muted-foreground" />
            <h4 className="font-medium text-foreground">{t("factors.nonModifiable")}</h4>
          </div>
          <div className="space-y-2">
            {nonModifiable.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-foreground">{factor.name}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getImpactColor(factor.impact)}`}>
                  {factor.impact} {t("factors.impact")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
