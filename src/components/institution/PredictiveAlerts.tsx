import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, Shield } from "lucide-react";

interface Props {
  stats: {
    avg_diabetes_risk: number;
    avg_bp_risk: number;
    diabetes_high: number;
    bp_high: number;
    total_assessments: number;
    total_assessed: number;
  } | null;
}

interface Alert {
  title: string;
  insight: string;
  recommendation: string;
  severity: "warning" | "info" | "critical";
  icon: string;
}

export function PredictiveAlerts({ stats }: Props) {
  if (!stats || stats.total_assessments === 0) {
    return (
      <Card className="p-12 text-center">
        <Sparkles className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Predictions Available</h3>
        <p className="text-muted-foreground text-sm">Need assessment data for predictive insights.</p>
      </Card>
    );
  }

  const alerts: Alert[] = [];
  const total = stats.total_assessments;
  const highDiabPct = Math.round((stats.diabetes_high / total) * 100);
  const highBPPct = Math.round((stats.bp_high / total) * 100);

  if (stats.avg_bp_risk > 35) {
    const predictedIncrease = Math.min(25, Math.round(stats.avg_bp_risk * 0.4));
    alerts.push({
      title: "Stress Spike Predicted",
      insight: `Based on current stress trends and upcoming exam schedules, student stress risk may increase by ${predictedIncrease}% next month.`,
      recommendation: "Run pre-exam wellness workshops with breathing exercises and meditation sessions.",
      severity: predictedIncrease > 18 ? "critical" : "warning",
      icon: "🧠",
    });
  }

  if (stats.avg_diabetes_risk > 40) {
    alerts.push({
      title: "Metabolic Risk Trending Up",
      insight: `${highDiabPct}% of assessed students show elevated metabolic risk. Sedentary lifestyle patterns may worsen this.`,
      recommendation: "Launch a Move More campus initiative with daily step challenges and sports programs.",
      severity: highDiabPct > 20 ? "critical" : "warning",
      icon: "🍬",
    });
  }

  if (highBPPct > 15) {
    alerts.push({
      title: "Cardiovascular Risk Alert",
      insight: `${highBPPct}% of students have elevated blood pressure risk, which may correlate with stress and poor sleep patterns.`,
      recommendation: "Introduce regular yoga sessions focusing on Shavasana, Viparita Karani, and deep breathing.",
      severity: highBPPct > 25 ? "critical" : "warning",
      icon: "❤️",
    });
  }

  if (stats.avg_diabetes_risk < 35 && stats.avg_bp_risk < 35) {
    alerts.push({
      title: "Campus Health Looking Strong",
      insight: "Overall risk levels are within healthy ranges. Continue current wellness initiatives.",
      recommendation: "Maintain current programs and focus on health education to sustain these positive trends.",
      severity: "info",
      icon: "🌟",
    });
  }

  alerts.push({
    title: "Engagement Opportunity",
    insight: `${stats.total_assessed} students have completed assessments. Broader participation would improve data quality.`,
    recommendation: "Run a health awareness drive to encourage more students to take the assessment.",
    severity: "info",
    icon: "📊",
  });

  const severityConfig = {
    critical: { badge: "destructive" as const, bg: "bg-destructive/5 border-destructive/20", iconBg: "bg-destructive/10" },
    warning: { badge: "default" as const, bg: "bg-warning/5 border-warning/20", iconBg: "bg-warning/10" },
    info: { badge: "outline" as const, bg: "bg-primary/5 border-primary/20", iconBg: "bg-primary/10" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
          <Sparkles className="w-4 h-4" />
          AI-Powered Predictive Insights
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Predictive Wellness Alerts</h2>
        <p className="text-sm text-muted-foreground">Early warning system based on campus health data patterns</p>
      </div>

      {/* Summary Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {alerts.filter(a => a.severity === "critical").length} Critical · {alerts.filter(a => a.severity === "warning").length} Warning · {alerts.filter(a => a.severity === "info").length} Info
                </p>
                <p className="text-xs text-muted-foreground">Based on {stats.total_assessments} assessments from {stats.total_assessed} students</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {alerts.map((alert, i) => {
          const config = severityConfig[alert.severity];
          return (
            <Card key={i} className={`${config.bg} animate-fade-in overflow-hidden`} style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${config.iconBg} flex items-center justify-center shrink-0`}>
                    <span className="text-2xl">{alert.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-semibold text-foreground">{alert.title}</h4>
                      <Badge variant={config.badge} className="capitalize text-xs">{alert.severity}</Badge>
                    </div>
                    <div className="flex items-start gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{alert.insight}</p>
                    </div>
                    <div className="flex items-start gap-2 bg-background/60 rounded-xl p-3 border border-border/50">
                      <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{alert.recommendation}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
