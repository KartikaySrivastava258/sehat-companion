import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Action { text: string; category: "diet" | "exercise" | "lifestyle" | "monitoring"; }
interface ActionPlanProps { actions: Action[]; }

export function ActionPlan({ actions }: ActionPlanProps) {
  const { t } = useLanguage();
  const getCategoryIcon = (category: string) => {
    switch (category) { case "diet": return "🥗"; case "exercise": return "🚶"; case "lifestyle": return "😴"; case "monitoring": return "📊"; default: return "✨"; }
  };

  return (
    <Card variant="elevated" className="animate-fade-in" style={{ animationDelay: "500ms" }}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          {t("actionPlan.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{t("actionPlan.subtitle")}</p>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-secondary/50 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
              <span className="text-xl">{getCategoryIcon(action.category)}</span>
              <div className="flex-1"><p className="text-foreground">{action.text}</p></div>
              <CheckCircle className="w-5 h-5 text-muted-foreground/50 shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
