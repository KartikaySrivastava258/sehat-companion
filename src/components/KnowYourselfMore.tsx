import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Sun,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentData } from "@/components/AssessmentForm";
import { RiskAnalysis } from "@/components/ResultsSection";

interface KnowYourselfProps {
  assessmentData: AssessmentData;
  riskAnalysis: RiskAnalysis;
}

interface WellnessInsights {
  personalInsight: string;
  bodyExperiences: Array<{ title: string; explanation: string }>;
  yogaPractices: Array<{
    name: string;
    nameHindi?: string;
    whyForYou: string;
    traditionalSignificance: string;
    wellnessSupport: string[];
  }>;
  herbalKnowledge: Array<{
    name: string;
    traditionalRole: string;
    whyForYou: string;
    wellnessAssociations: string[];
  }>;
  dailyHabits: Array<{ habit: string; why: string }>;
  reflectionMessage: string;
}

function YogaCard({ practice, index }: { practice: WellnessInsights["yogaPractices"][0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden animate-fade-in border-border/60 hover:shadow-md transition-shadow" style={{ animationDelay: `${index * 80}ms` }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Wind className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-display font-semibold text-foreground">{practice.name}</h4>
                {practice.nameHindi && <span className="text-sm text-muted-foreground">({practice.nameHindi})</span>}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{practice.whyForYou}</p>
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
                Traditional Significance
              </h5>
              <p className="text-sm text-muted-foreground italic">{practice.traditionalSignificance}</p>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-foreground mb-1">Potential Wellness Support</h5>
              <div className="flex flex-wrap gap-1.5">
                {practice.wellnessSupport.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function HerbCard({ herb, index }: { herb: WellnessInsights["herbalKnowledge"][0]; index: number }) {
  const [open, setOpen] = useState(false);
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
                <h4 className="font-display font-semibold text-foreground">{herb.name}</h4>
                <Badge variant="secondary" className="text-xs">Educational</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{herb.whyForYou}</p>
            </div>
            <div className="shrink-0 mt-2 text-muted-foreground">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
            <div>
              <h5 className="text-sm font-semibold text-foreground mb-1">Traditional Role</h5>
              <p className="text-sm text-muted-foreground">{herb.traditionalRole}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {herb.wellnessAssociations.map((a, i) => (
                <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function KnowYourselfMore({ assessmentData, riskAnalysis }: KnowYourselfProps) {
  const [insights, setInsights] = useState<WellnessInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("know-yourself", {
        body: { assessmentData, riskAnalysis },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setInsights(data.insights);
    } catch (e) {
      console.error("Know yourself error:", e);
      setError("Unable to generate personalized insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <section className="animate-fade-in" style={{ animationDelay: "600ms" }}>
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
          <Sparkles className="w-4 h-4" />
          AI-Powered Personalized Wellness Education
        </div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-1">
          Know Yourself More
        </h3>
        <p className="text-sm text-muted-foreground">
          Understanding your body through lifestyle patterns and traditional wellness wisdom.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm">Generating your personalized wellness insights...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={fetchInsights} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* Insights Content */}
      {insights && !loading && (
        <div className="space-y-6">
          {/* 1. Personal Wellness Insight */}
          <Card className="p-5 bg-secondary/50 border-border/60">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-foreground mb-2">Personal Wellness Insight</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{insights.personalInsight}</p>
              </div>
            </div>
          </Card>

          {/* 2. What Your Body May Be Experiencing */}
          <div>
            <h4 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              What Your Body May Be Experiencing
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {insights.bodyExperiences.map((exp, i) => (
                <Card key={i} className="p-4 border-border/60 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <h5 className="font-semibold text-foreground text-sm mb-1">{exp.title}</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{exp.explanation}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* 3. Rooted Wellness Practices */}
          <div>
            <h4 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              🧘 Personalized Yoga & Breathing Practices
            </h4>
            <div className="space-y-3">
              {insights.yogaPractices.map((p, i) => (
                <YogaCard key={i} practice={p} index={i} />
              ))}
            </div>
          </div>

          {/* 4. Traditional Herbal Knowledge */}
          <div>
            <h4 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              🌿 Traditional Herbal Knowledge
              <Badge variant="outline" className="text-xs font-normal">Educational</Badge>
            </h4>
            <div className="space-y-3">
              {insights.herbalKnowledge.map((h, i) => (
                <HerbCard key={i} herb={h} index={i} />
              ))}
            </div>
          </div>

          {/* 5. Small Daily Habits */}
          <div>
            <h4 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary" />
              Small Daily Habits
            </h4>
            <div className="space-y-2">
              {insights.dailyHabits.map((h, i) => (
                <Card key={i} className="p-4 border-border/60 flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="text-primary font-bold text-lg mt-[-2px]">•</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{h.habit}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{h.why}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 6. Personal Reflection */}
          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-semibold text-foreground mb-2">Your Reflection</h4>
                <p className="text-sm text-muted-foreground leading-relaxed italic">{insights.reflectionMessage}</p>
              </div>
            </div>
          </Card>

          {/* Disclaimer */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This section provides <strong>educational wellness insights</strong> based on your lifestyle inputs. It is <strong>not</strong> a medical diagnosis, prescription, or treatment recommendation. Always consult a qualified healthcare professional before making health decisions.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
