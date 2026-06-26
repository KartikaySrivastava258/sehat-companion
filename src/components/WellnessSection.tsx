import { useState } from "react";
import {
  getPersonalizedRecommendations,
  WellnessRecommendation,
} from "@/data/wellnessKnowledge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Leaf, Wind, Heart, Brain, AlertTriangle, BookOpen, Shield } from "lucide-react";

interface WellnessSectionProps {
  diabetesRiskScore: number;
  bpRiskScore: number;
  stressLevel?: string;
}

function PracticeCard({ rec, index }: { rec: WellnessRecommendation; index: number }) {
  const [open, setOpen] = useState(false);
  const p = rec.practice;

  const typeIcon =
    p.type === "pranayama" ? <Wind className="w-4 h-4" /> :
    p.type === "herb" ? <Leaf className="w-4 h-4" /> :
    <Heart className="w-4 h-4" />;

  const typeBadgeVariant = p.type === "herb" ? "secondary" : "default";
  const typeLabel =
    p.type === "pranayama" ? "Pranayama" :
    p.type === "herb" ? "Herb" : "Yoga Asana";

  return (
    <Card
      className="overflow-hidden animate-fade-in border-border/60 hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
            {p.imagePath ? (
              <img
                src={p.imagePath}
                alt={`${p.name} illustration`}
                className="w-16 h-16 rounded-xl object-cover shrink-0 mt-0.5 shadow-sm"
                loading="lazy"
              />
            ) : (
              <span className="text-3xl shrink-0 mt-0.5">{p.imageEmoji}</span>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-display font-semibold text-foreground">
                  {p.name}
                </h4>
                {p.nameHindi && (
                  <span className="text-sm text-muted-foreground">
                    ({p.nameHindi})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={typeBadgeVariant} className="text-xs gap-1">
                  {typeIcon}
                  {typeLabel}
                </Badge>
                {p.primarySupport.slice(0, 2).map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {rec.reason}
              </p>
            </div>
            <div className="shrink-0 mt-2 text-muted-foreground">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
            {/* Scientific Significance */}
            <div>
              <h5 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                Scientific Significance
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {p.scientificSignificance.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Traditional Context */}
            <div>
              <h5 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <Leaf className="w-3.5 h-3.5 text-primary" />
                Traditional Context
              </h5>
              <p className="text-sm text-muted-foreground italic">
                {p.traditionalContext}
              </p>
            </div>

            {/* Beginner Guide */}
            {p.beginnerGuide && (
              <div>
                <h5 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
                  🧘 Beginner Guide
                </h5>
                <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                  {p.beginnerGuide}
                </p>
              </div>
            )}

            {/* Safety Note */}
            <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {p.safetyNote}
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function WellnessSection({
  diabetesRiskScore,
  bpRiskScore,
  stressLevel,
}: WellnessSectionProps) {
  const { yogaPractices, herbalKnowledge, primaryFocus } =
    getPersonalizedRecommendations(diabetesRiskScore, bpRiskScore, stressLevel);

  const focusIcon =
    primaryFocus.includes("Stress") ? <Brain className="w-5 h-5 text-primary" /> :
    primaryFocus.includes("Metabolic") ? <Leaf className="w-5 h-5 text-primary" /> :
    primaryFocus.includes("Cardiovascular") ? <Heart className="w-5 h-5 text-primary" /> :
    <Shield className="w-5 h-5 text-primary" />;

  return (
    <section className="animate-fade-in" style={{ animationDelay: "500ms" }}>
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
          🕉️ Rooted in Indian Wellness Science
        </div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          Your Personalized Wellness Flow
        </h3>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          {focusIcon}
          <span className="text-sm">Primary Focus: <span className="font-semibold text-foreground">{primaryFocus}</span></span>
        </div>
      </div>

      {/* Evidence Layer */}
      <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-primary" />
          Evidence Integration
        </p>
        <ul className="space-y-1 ml-5">
          <li>• WHO recognizes yoga benefits for mental health and NCDs</li>
          <li>• Growing research on mind-body interventions for metabolic health</li>
          <li>• Lifestyle-based diabetes prevention programs show significant outcomes</li>
          <li>• Indian traditional knowledge systems recognized by AYUSH Ministry</li>
        </ul>
      </div>

      {/* Yoga & Pranayama */}
      {yogaPractices.length > 0 && (
        <div className="mb-6">
          <h4 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
            🧘 Recommended Yoga & Pranayama
          </h4>
          <div className="space-y-3">
            {yogaPractices.map((rec, i) => (
              <PracticeCard key={rec.practice.id} rec={rec} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Herbal Knowledge */}
      {herbalKnowledge.length > 0 && (
        <div className="mb-6">
          <h4 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
            🌿 Traditional Herbal Knowledge
            <Badge variant="outline" className="text-xs font-normal">Educational</Badge>
          </h4>
          <div className="space-y-3">
            {herbalKnowledge.map((rec, i) => (
              <PracticeCard key={rec.practice.id} rec={rec} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">
            Important Wellness Disclaimer
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The information provided here is for <strong>educational purposes only</strong> and is rooted in traditional Indian wellness systems (Yoga & Ayurveda).
            This does <strong>not</strong> constitute medical advice, diagnosis, or treatment. These practices are <strong>not</strong> replacements for professional medical care.
            Always consult a qualified healthcare professional before starting any new health practice or using herbal supplements, especially if you have existing medical conditions or are on medication.
          </p>
        </div>
      </div>
    </section>
  );
}
