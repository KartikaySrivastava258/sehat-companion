import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface Props {
  stats: {
    avg_diabetes_risk: number;
    avg_bp_risk: number;
    diabetes_high: number;
    bp_high: number;
    total_assessments: number;
  } | null;
}

interface Program {
  title: string;
  icon: string;
  description: string;
  tags: string[];
  impact: "High" | "Medium";
}

export function WellnessProgramRecs({ stats }: Props) {
  if (!stats || stats.total_assessments === 0) {
    return (
      <Card className="p-12 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Recommendations Yet</h3>
        <p className="text-muted-foreground text-sm">Need assessment data to generate program recommendations.</p>
      </Card>
    );
  }

  const programs: Program[] = [];

  if (stats.avg_bp_risk > 35) {
    programs.push(
      { title: "Weekly Yoga Sessions", icon: "🧘", description: "Structured yoga classes focusing on stress-relieving asanas like Shavasana, Balasana, and Setu Bandhasana.", tags: ["Stress", "BP"], impact: "High" },
      { title: "Breathing Workshops", icon: "🫁", description: "Regular pranayama sessions teaching Anulom Vilom, Bhramari, and deep breathing techniques.", tags: ["Stress", "Anxiety"], impact: "High" },
      { title: "Meditation Rooms", icon: "🕉️", description: "Dedicated quiet spaces for mindfulness practice and emotional regulation.", tags: ["Mental Health"], impact: "Medium" },
      { title: "Counselling Awareness Drives", icon: "💬", description: "Normalize mental health support through awareness campaigns and accessible counselling.", tags: ["Mental Health"], impact: "Medium" },
    );
  }

  if (stats.avg_diabetes_risk > 35) {
    programs.push(
      { title: "Campus Walking Tracks", icon: "🚶", description: "Marked walking paths with distance indicators to encourage daily physical activity.", tags: ["Metabolic", "Fitness"], impact: "High" },
      { title: "Sports Clubs & Fitness Challenges", icon: "🏃", description: "Inter-department sports events and monthly fitness challenges with rewards.", tags: ["Activity", "Engagement"], impact: "High" },
      { title: "Healthy Mess Menu Initiative", icon: "🥗", description: "Work with campus cafeterias to offer balanced, nutritious meal options with calorie labels.", tags: ["Nutrition", "Metabolic"], impact: "Medium" },
    );
  }

  programs.push(
    { title: "Sleep Hygiene Education", icon: "😴", description: "Workshops on sleep schedules, screen time management, and creating healthy sleep environments.", tags: ["Sleep", "Wellness"], impact: "Medium" },
    { title: "Wellness Ambassador Program", icon: "🌟", description: "Train student volunteers to promote health awareness and peer support across departments.", tags: ["Leadership", "Community"], impact: "High" },
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-1.5 rounded-full text-sm font-medium mb-3">
          <BookOpen className="w-4 h-4" />
          Evidence-Based Programs
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Recommended Wellness Programs</h2>
        <p className="text-sm text-muted-foreground">Institution-level interventions based on campus health data</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {programs.map((p, i) => (
          <Card key={i} className="group hover:shadow-md transition-all duration-300 animate-fade-in overflow-hidden relative" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-2xl">{p.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{p.title}</h4>
                    <Badge variant={p.impact === "High" ? "default" : "outline"} className="text-xs shrink-0">{p.impact} Impact</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {p.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs bg-secondary/50">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
