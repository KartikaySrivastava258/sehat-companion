import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface RiskScoreCardProps {
  title: string;
  score: number;
  confidence: string;
  comparison: string;
  icon: React.ReactNode;
  delay?: number;
}

export function RiskScoreCard({ title, score, confidence, comparison, icon, delay = 0 }: RiskScoreCardProps) {
  const { t } = useLanguage();
  
  const getRiskLevel = (score: number) => {
    if (score <= 30) return { label: t("risk.low"), color: "text-success", bg: "bg-success/10", ring: "stroke-success" };
    if (score <= 60) return { label: t("risk.moderate"), color: "text-warning", bg: "bg-warning/10", ring: "stroke-warning" };
    return { label: t("risk.higher"), color: "text-danger", bg: "bg-danger/10", ring: "stroke-danger" };
  };

  const risk = getRiskLevel(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card variant="elevated" className="overflow-hidden animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">{icon}{title}</CardTitle>
          <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", risk.bg, risk.color)}>{risk.label}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" className={cn("transition-all duration-1000 ease-out", risk.ring)} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-bold text-foreground">{score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("risk.confidence")}</p>
              <p className="font-medium text-foreground">{confidence}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("risk.comparison")}</p>
              <p className="text-sm text-foreground">{comparison}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
