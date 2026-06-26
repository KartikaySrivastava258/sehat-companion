import { Card, CardContent } from "@/components/ui/card";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

interface Props {
  stats: {
    avg_diabetes_risk: number;
    avg_bp_risk: number;
    total_assessed: number;
  } | null;
  institutionName: string;
}

export function CampusWellnessScore({ stats, institutionName }: Props) {
  if (!stats || stats.total_assessed === 0) {
    return <Card className="p-8 text-center text-muted-foreground">Not enough data to calculate wellness score.</Card>;
  }

  const metabolicScore = Math.max(0, 100 - (stats.avg_diabetes_risk || 0));
  const cardiovascularScore = Math.max(0, 100 - (stats.avg_bp_risk || 0));
  const stressScore = Math.max(0, 100 - Math.round(((stats.avg_diabetes_risk || 0) + (stats.avg_bp_risk || 0)) / 4));
  const overallScore = Math.round((metabolicScore + cardiovascularScore + stressScore) / 3);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "hsl(var(--success))";
    if (score >= 50) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getScoreClass = (score: number) => {
    if (score >= 70) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Needs Attention";
    return "Critical";
  };

  const radialData = [{ name: "Score", value: overallScore, fill: getScoreColor(overallScore) }];

  const dimensions = [
    { label: "Metabolic Health", score: metabolicScore, icon: "🍬", desc: "Diet & blood sugar indicators" },
    { label: "Cardiovascular Health", score: cardiovascularScore, icon: "❤️", desc: "Heart & blood pressure health" },
    { label: "Stress Balance", score: stressScore, icon: "🧠", desc: "Overall stress & lifestyle balance" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Score Card */}
      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardContent className="pt-8 pb-8 text-center relative">
          <p className="text-sm text-muted-foreground mb-1">{institutionName}</p>
          <h2 className="font-display text-lg font-semibold text-foreground mb-6">Campus Wellness Score</h2>
          
          <div className="w-[200px] h-[200px] mx-auto relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                data={radialData}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                  background={{ fill: "hsl(var(--muted))" }}
                  dataKey="value"
                  angleAxisId={0}
                  cornerRadius={12}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${getScoreClass(overallScore)}`}>{overallScore}</span>
              <span className="text-xs text-muted-foreground mt-1">out of 100</span>
            </div>
          </div>

          <p className={`text-lg font-semibold mt-4 ${getScoreClass(overallScore)}`}>{getScoreLabel(overallScore)}</p>
        </CardContent>
      </Card>

      {/* Dimension Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        {dimensions.map((d) => (
          <Card key={d.label} className="group hover:shadow-md transition-all duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{d.icon}</span>
                <h4 className="text-sm font-semibold text-foreground">{d.label}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{d.desc}</p>
              
              <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${d.score}%`, background: getScoreColor(d.score) }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">0</span>
                <span className={`text-2xl font-bold ${getScoreClass(d.score)}`}>{d.score}</span>
                <span className="text-xs text-muted-foreground">100</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
