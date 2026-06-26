import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle, Stethoscope, Lightbulb } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LabValue {
  name: string;
  reading: string;
  normalRange: string;
  status: "normal" | "borderline" | "attention";
  simpleExplanation: string;
  interpretation: string;
  suggestion?: string;
}

interface LabReportAnalysis {
  labValues: LabValue[];
  overallSummary: string;
  keyTakeaways: string[];
  doctorConsultAdvice: string;
}

interface LabReportResultProps {
  analysis: LabReportAnalysis;
}

export const LabReportResult = ({ analysis }: LabReportResultProps) => {
  const { t } = useLanguage();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "normal":
        return { icon: CheckCircle, color: "text-success", bgColor: "bg-success/10", borderColor: "border-success/20", badgeClass: "bg-success/20 text-success border-success/30" };
      case "borderline":
        return { icon: AlertTriangle, color: "text-warning", bgColor: "bg-warning/10", borderColor: "border-warning/20", badgeClass: "bg-warning/20 text-warning border-warning/30" };
      case "attention":
        return { icon: AlertCircle, color: "text-danger", bgColor: "bg-danger/10", borderColor: "border-danger/20", badgeClass: "bg-danger/20 text-danger border-danger/30" };
      default:
        return { icon: CheckCircle, color: "text-muted-foreground", bgColor: "bg-muted/10", borderColor: "border-border", badgeClass: "" };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            {t("lab.overallSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{analysis.overallSummary}</p>
        </CardContent>
      </Card>

      {analysis.labValues && analysis.labValues.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-foreground">{t("lab.valuesExplained")}</h3>
          <div className="grid gap-4">
            {analysis.labValues.map((value, index) => {
              const config = getStatusConfig(value.status);
              const StatusIcon = config.icon;
              return (
                <Card key={index} className={`border ${config.borderColor} ${config.bgColor}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-5 h-5 ${config.color}`} />
                        <h4 className="font-semibold text-foreground">{value.name}</h4>
                      </div>
                      <Badge className={config.badgeClass}>
                        {value.status === "normal" ? t("lab.normal") : value.status === "borderline" ? t("lab.borderline") : t("lab.needsAttention")}
                      </Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">{t("lab.yourReading")}</p>
                        <p className="font-medium text-foreground">{value.reading}</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">{t("lab.normalRange")}</p>
                        <p className="font-medium text-foreground">{value.normalRange}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{t("lab.whatItMeasures")}</span> {value.simpleExplanation}
                      </p>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{t("lab.whatThisMeans")}</span> {value.interpretation}
                      </p>
                      {value.suggestion && (
                        <p className="text-sm text-primary">
                          <span className="font-medium">💡 {t("lab.tip")}</span> {value.suggestion}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {analysis.keyTakeaways && analysis.keyTakeaways.length > 0 && (
        <Card variant="bordered" className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              {t("lab.keyPoints")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.keyTakeaways.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="bg-secondary/50 border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">{t("lab.consultDoctor")}</p>
              <p className="text-sm text-muted-foreground">{analysis.doctorConsultAdvice}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center p-4 bg-muted/30 rounded-xl">
        <p className="text-xs text-muted-foreground">{t("lab.aiDisclaimer")}</p>
      </div>
    </div>
  );
};
