import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Eye, Lock, Users, FileText, Globe } from "lucide-react";

export function PrivacyNotice() {
  const items = [
    { icon: <Lock className="w-5 h-5" />, title: "No Personal Medical Records Stored", desc: "The institution dashboard never stores or displays individual health records. All processing happens at the aggregate level.", color: "bg-primary/10 text-primary" },
    { icon: <Eye className="w-5 h-5" />, title: "All Data Anonymized", desc: "Individual student identities are completely separated from health data. Administrators cannot trace any data point to a specific student.", color: "bg-success/10 text-success" },
    { icon: <Users className="w-5 h-5" />, title: "Only Aggregated Insights", desc: "The dashboard shows population-level trends and statistics. Minimum group sizes are enforced to prevent re-identification.", color: "bg-warning/10 text-warning" },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Student Identity Protected", desc: "Row-level security ensures students only access their own data. Institution admins see only anonymous aggregates.", color: "bg-accent/10 text-accent" },
    { icon: <FileText className="w-5 h-5" />, title: "Ethical AI Usage", desc: "AI-generated insights and campaigns are educational recommendations, not medical advice. No diagnostic claims are made.", color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-1.5 rounded-full text-sm font-medium mb-3">
          <ShieldCheck className="w-4 h-4" />
          Privacy & Ethics First
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Privacy & Data Ethics</h2>
        <p className="text-sm text-muted-foreground">Our commitment to student privacy and responsible data use</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <Card key={i} className="group hover:shadow-md transition-all duration-300 animate-fade-in overflow-hidden" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-success/5 to-accent/5" />
        <CardContent className="pt-6 pb-6 relative">
          <div className="flex items-center gap-3 justify-center mb-3">
            <Globe className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">UN Sustainable Development Goals Alignment</h4>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-background/60 rounded-xl p-4 border border-border/50 text-center">
              <p className="text-2xl mb-1">🏥</p>
              <p className="text-sm font-semibold text-foreground">SDG 3 — Good Health & Well-Being</p>
              <p className="text-xs text-muted-foreground mt-1">Promoting preventive health awareness and early risk identification</p>
            </div>
            <div className="bg-background/60 rounded-xl p-4 border border-border/50 text-center">
              <p className="text-2xl mb-1">📚</p>
              <p className="text-sm font-semibold text-foreground">SDG 4 — Quality Education</p>
              <p className="text-xs text-muted-foreground mt-1">Supporting health literacy, wellness education, and youth awareness</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
