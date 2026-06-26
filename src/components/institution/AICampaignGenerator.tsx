import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  stats: {
    avg_diabetes_risk: number;
    avg_bp_risk: number;
    diabetes_high: number;
    bp_high: number;
    total_assessments: number;
  } | null;
}

interface Campaign {
  title: string;
  reason: string;
  activities: string[];
  priority: "high" | "moderate" | "low";
  duration: string;
}

function generateCampaigns(stats: Props["stats"]): Campaign[] {
  if (!stats || stats.total_assessments === 0) return [];
  const campaigns: Campaign[] = [];
  const total = stats.total_assessments;
  const highDiabetesPct = Math.round((stats.diabetes_high / total) * 100);
  const highBPPct = Math.round((stats.bp_high / total) * 100);

  if (stats.avg_bp_risk > 40 || highBPPct > 15) {
    campaigns.push({
      title: "Campus Stress Reset Week",
      reason: `${highBPPct}% of students show elevated BP risk, often linked to stress.`,
      activities: ["Guided yoga and pranayama sessions", "Breathing workshops (Anulom Vilom, Bhramari)", "Screen detox challenge", "Mental health awareness talks", "Meditation room setup"],
      priority: highBPPct > 25 ? "high" : "moderate",
      duration: "1 Week",
    });
  }

  if (stats.avg_diabetes_risk > 40 || highDiabetesPct > 10) {
    campaigns.push({
      title: "Move More Campus Initiative",
      reason: `${highDiabetesPct}% of students show elevated metabolic risk. Physical activity is key.`,
      activities: ["10,000 step challenge with leaderboard", "Sports hour programs", "Healthy mess menu week", "Surya Namaskar morning sessions", "Nutrition awareness workshops"],
      priority: highDiabetesPct > 20 ? "high" : "moderate",
      duration: "2 Weeks",
    });
  }

  campaigns.push({
    title: "Know Your Health Numbers Week",
    reason: "Encouraging regular health checkups and self-awareness.",
    activities: ["Free health assessment drives", "BMI and BP check camps", "Sleep hygiene workshops", "Healthy cooking demonstrations"],
    priority: "low",
    duration: "1 Week",
  });

  if (stats.avg_diabetes_risk > 50 && stats.avg_bp_risk > 50) {
    campaigns.push({
      title: "Holistic Wellness Transformation Program",
      reason: "Both metabolic and cardiovascular risks are elevated campus-wide.",
      activities: ["Weekly yoga and meditation sessions", "Ayurvedic nutrition education", "Stress counselling awareness", "Fitness tracking challenges", "Wellness ambassador program"],
      priority: "high",
      duration: "1 Month",
    });
  }

  return campaigns.sort((a, b) => {
    const order = { high: 0, moderate: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

const priorityConfig = {
  high: { badge: "destructive" as const, gradient: "from-destructive/10 to-destructive/5", border: "border-destructive/20" },
  moderate: { badge: "default" as const, gradient: "from-warning/10 to-warning/5", border: "border-warning/20" },
  low: { badge: "outline" as const, gradient: "from-primary/10 to-primary/5", border: "border-primary/20" },
};

export function AICampaignGenerator({ stats }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setCampaigns(generateCampaigns(stats));
      setGenerated(true);
      setLoading(false);
    }, 1500);
  };

  if (!stats || stats.total_assessments === 0) {
    return (
      <Card className="p-12 text-center">
        <Megaphone className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
        <p className="text-muted-foreground text-sm">Need assessment data to generate campaigns.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
          <Sparkles className="w-4 h-4" />
          AI-Powered Suggestions
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">AI Awareness Campaign Generator</h2>
        <p className="text-sm text-muted-foreground mb-4">Generate targeted wellness campaigns based on campus health trends</p>
        {!generated && (
          <Button onClick={handleGenerate} disabled={loading} size="lg" className="gap-2 px-8">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Campaigns
          </Button>
        )}
      </div>

      {generated && campaigns.length > 0 && (
        <div className="space-y-4">
          {campaigns.map((c, i) => {
            const config = priorityConfig[c.priority];
            return (
              <Card key={i} className={`animate-fade-in overflow-hidden ${config.border}`} style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} pointer-events-none`} />
                <CardHeader className="pb-3 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{c.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">Duration: {c.duration}</p>
                      </div>
                    </div>
                    <Badge variant={config.badge} className="capitalize">{c.priority} priority</Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm text-muted-foreground mb-4 bg-secondary/50 rounded-lg p-3">{c.reason}</p>
                  <h5 className="text-sm font-semibold text-foreground mb-3">Suggested Activities:</h5>
                  <ul className="space-y-2">
                    {c.activities.map((a, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {a}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
