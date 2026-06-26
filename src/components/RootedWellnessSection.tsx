import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Brain,
  Wind,
  Leaf,
  Heart,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Activity,
  Moon,
  Globe,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentData } from "@/components/AssessmentForm";
import { RiskAnalysis } from "@/components/ResultsSection";
import { useLanguage } from "@/contexts/LanguageContext";

interface RootedWellnessProps {
  assessmentData: AssessmentData;
  riskAnalysis: RiskAnalysis;
}

interface WellnessInsights {
  wellnessStory: string;
  bodyBalance: {
    stressRegulation: number;
    metabolicBalance: number;
    cardiovascularLoad: number;
    recoveryScore: number;
    summary: string;
  };
  wellnessFocus: {
    primary: string;
    explanation: string;
  };
  recommendedPractices: Array<{
    name: string;
    nameLocal?: string;
    type: string;
    explanation: string;
    traditionalSignificance: string;
    youtubeQuery: string;
  }>;
  traditionalInsights: Array<{
    name: string;
    traditionalRole: string;
    whyForYou: string;
    youtubeQuery: string;
  }>;
  globalContext: string;
  closingMessage: string;
}

function BalanceBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const percentage = (value / 10) * 100;
  const color = value >= 7 ? "bg-success" : value >= 4 ? "bg-warning" : "bg-destructive";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-foreground font-medium">
          {icon} {label}
        </span>
        <span className="text-muted-foreground">{value}/10</span>
      </div>
      <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function PracticeCard({ practice, index }: { practice: WellnessInsights["recommendedPractices"][0]; index: number }) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const typeIcon = practice.type === "pranayama" ? <Wind className="w-5 h-5 text-primary" /> :
    practice.type === "meditation" ? <Brain className="w-5 h-5 text-primary" /> :
    <Heart className="w-5 h-5 text-primary" />;

  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(practice.youtubeQuery)}`;

  return (
    <Card className="overflow-hidden animate-fade-in border-border/60 hover:shadow-md transition-shadow" style={{ animationDelay: `${index * 80}ms` }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              {typeIcon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-display font-semibold text-foreground">{practice.name}</h4>
                {practice.nameLocal && <span className="text-sm text-muted-foreground">({practice.nameLocal})</span>}
              </div>
              <Badge variant="default" className="text-xs gap-1 mb-1.5 capitalize">{practice.type}</Badge>
              <p className="text-sm text-muted-foreground line-clamp-2">{practice.explanation}</p>
            </div>
            <div className="shrink-0 mt-2 text-muted-foreground">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
            <div>
              <h5 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <Leaf className="w-3.5 h-3.5 text-primary" />
                {t("rooted.traditionalSignificance")}
              </h5>
              <p className="text-sm text-muted-foreground italic">{practice.traditionalSignificance}</p>
            </div>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              🎥 {t("rooted.learnVisually")}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function InsightCard({ insight, index }: { insight: WellnessInsights["traditionalInsights"][0]; index: number }) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(insight.youtubeQuery)}`;

  return (
    <Card className="overflow-hidden animate-fade-in border-border/60 hover:shadow-md transition-shadow" style={{ animationDelay: `${index * 80}ms` }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
              <Leaf className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-display font-semibold text-foreground">{insight.name}</h4>
                <Badge variant="secondary" className="text-xs">{t("rooted.educational")}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{insight.whyForYou}</p>
            </div>
            <div className="shrink-0 mt-2 text-muted-foreground">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
            <div>
              <h5 className="text-sm font-semibold text-foreground mb-1">{t("rooted.traditionalRole")}</h5>
              <p className="text-sm text-muted-foreground">{insight.traditionalRole}</p>
            </div>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              🎥 {t("rooted.learnMore")}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function RootedWellnessSection({ assessmentData, riskAnalysis }: RootedWellnessProps) {
  const [insights, setInsights] = useState<WellnessInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("know-yourself", {
        body: { assessmentData, riskAnalysis, language },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setInsights(data.insights);
    } catch (e) {
      console.error("Rooted wellness error:", e);
      setError(t("rooted.errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [language]);

  const focusIcon =
    insights?.wellnessFocus?.primary?.includes("Stress") ? <Brain className="w-5 h-5 text-primary" /> :
    insights?.wellnessFocus?.primary?.includes("Metabolic") ? <Activity className="w-5 h-5 text-primary" /> :
    insights?.wellnessFocus?.primary?.includes("Heart") ? <Heart className="w-5 h-5 text-primary" /> :
    <Sparkles className="w-5 h-5 text-primary" />;

  return (
    <section className="animate-fade-in" style={{ animationDelay: "500ms" }}>
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
          🕉️ {t("rooted.badge")}
        </div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-1">
          {t("rooted.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("rooted.subtitle")}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">{t("rooted.generating")}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={fetchInsights} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("common.tryAgain")}
          </Button>
        </div>
      )}

      {/* Insights Content */}
      {insights && !loading && (
        <div className="space-y-6">
          {/* SECTION 1 — YOUR WELLNESS STORY */}
          <Card className="p-5 bg-secondary/50 border-border/60">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-foreground mb-2">{t("rooted.wellnessStory")}</h4>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {insights.wellnessStory}
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 2 — BODY BALANCE INDICATOR */}
          {insights.bodyBalance && (
            <Card className="p-5 border-border/60">
              <h4 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {t("rooted.bodyBalance")}
              </h4>
              <div className="space-y-3 mb-4">
                <BalanceBar label={t("rooted.stressRegulation")} value={insights.bodyBalance.stressRegulation} icon={<Brain className="w-3.5 h-3.5" />} />
                <BalanceBar label={t("rooted.metabolicBalance")} value={insights.bodyBalance.metabolicBalance} icon={<Activity className="w-3.5 h-3.5" />} />
                <BalanceBar label={t("rooted.cardiovascularLoad")} value={insights.bodyBalance.cardiovascularLoad} icon={<Heart className="w-3.5 h-3.5" />} />
                <BalanceBar label={t("rooted.recovery")} value={insights.bodyBalance.recoveryScore} icon={<Moon className="w-3.5 h-3.5" />} />
              </div>
              <p className="text-sm text-muted-foreground italic">{insights.bodyBalance.summary}</p>
            </Card>
          )}

          {/* SECTION 3 — WELLNESS FOCUS */}
          {insights.wellnessFocus && (
            <Card className="p-5 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                {focusIcon}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-display font-semibold text-foreground">{t("rooted.primaryFocus")}</h4>
                    <Badge variant="default" className="text-xs">{insights.wellnessFocus.primary}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insights.wellnessFocus.explanation}</p>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 4 — RECOMMENDED PRACTICES */}
          {insights.recommendedPractices?.length > 0 && (
            <div>
              <h4 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                🧘 {t("rooted.practicesTitle")}
              </h4>
              <div className="space-y-3">
                {insights.recommendedPractices.map((p, i) => (
                  <PracticeCard key={i} practice={p} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5 — TRADITIONAL WELLNESS INSIGHTS */}
          {insights.traditionalInsights?.length > 0 && (
            <div>
              <h4 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                🌿 {t("rooted.insightsTitle")}
                <Badge variant="outline" className="text-xs font-normal">{t("rooted.educational")}</Badge>
              </h4>
              <div className="space-y-3">
                {insights.traditionalInsights.map((ins, i) => (
                  <InsightCard key={i} insight={ins} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6 — GLOBAL CONTEXT */}
          {insights.globalContext && (
            <Card className="p-5 border-border/60 bg-secondary/30">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-2">{t("rooted.globalContext")}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insights.globalContext}</p>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 7 — CLOSING MESSAGE */}
          {insights.closingMessage && (
            <Card className="p-5 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-2">{t("rooted.closingTitle")}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">{insights.closingMessage}</p>
                </div>
              </div>
            </Card>
          )}

          {/* SAFETY NOTE */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("rooted.safetyNote")}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
