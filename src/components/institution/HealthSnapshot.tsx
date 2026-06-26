import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, Heart, Brain } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface Props {
  stats: {
    total_assessed: number;
    avg_diabetes_risk: number;
    avg_bp_risk: number;
    diabetes_high: number;
    diabetes_moderate: number;
    diabetes_low: number;
    bp_high: number;
    bp_moderate: number;
    bp_low: number;
    total_assessments: number;
  } | null;
  memberCount: number;
}

const RISK_COLORS = ["hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--success))"];

function RiskPieChart({ label, emoji, high, moderate, low, total }: { label: string; emoji: string; high: number; moderate: number; low: number; total: number }) {
  const data = [
    { name: "High Risk", value: high, pct: total > 0 ? Math.round((high / total) * 100) : 0 },
    { name: "Moderate", value: moderate, pct: total > 0 ? Math.round((moderate / total) * 100) : 0 },
    { name: "Low Risk", value: low, pct: total > 0 ? Math.round((low / total) * 100) : 0 },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{emoji}</span>
          <h4 className="font-semibold text-foreground">{label}</h4>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[140px] h-[140px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={RISK_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} students`, name]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2.5">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: RISK_COLORS[i] }} />
                  <span className="text-sm text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, value, label, iconColor }: { icon: any; value: string | number; label: string; iconColor: string }) {
  return (
    <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="pt-6 pb-5 text-center relative">
        <div className={`w-12 h-12 rounded-2xl ${iconColor} flex items-center justify-center mx-auto mb-3`}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

export function InstitutionHealthSnapshot({ stats, memberCount }: Props) {
  if (!stats) return (
    <Card className="p-12 text-center">
      <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">No Assessment Data Yet</h3>
      <p className="text-muted-foreground text-sm">Invite students to take health assessments. Data will appear here anonymously.</p>
    </Card>
  );

  const total = stats.total_assessments || 1;

  const comparisonData = [
    { name: "Diabetes", High: stats.diabetes_high, Moderate: stats.diabetes_moderate, Low: stats.diabetes_low },
    { name: "Blood Pressure", High: stats.bp_high, Moderate: stats.bp_moderate, Low: stats.bp_low },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
          <Activity className="w-4 h-4" />
          Live Campus Analytics
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">Campus Health Snapshot</h2>
        <p className="text-sm text-muted-foreground">Anonymous aggregated data — no individual identities revealed</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} value={stats.total_assessed} label="Students Assessed" iconColor="bg-primary/10 text-primary" />
        <StatCard icon={Activity} value={stats.total_assessments} label="Total Assessments" iconColor="bg-primary/10 text-primary" />
        <StatCard icon={Heart} value={`${stats.avg_diabetes_risk || 0}%`} label="Avg Diabetes Risk" iconColor="bg-accent/10 text-accent" />
        <StatCard icon={Brain} value={`${stats.avg_bp_risk || 0}%`} label="Avg BP Risk" iconColor="bg-warning/10 text-warning" />
      </div>

      {/* Pie Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <RiskPieChart label="Diabetes Risk Distribution" emoji="🍬" high={stats.diabetes_high} moderate={stats.diabetes_moderate} low={stats.diabetes_low} total={total} />
        <RiskPieChart label="Blood Pressure Risk Distribution" emoji="❤️" high={stats.bp_high} moderate={stats.bp_moderate} low={stats.bp_low} total={total} />
      </div>

      {/* Comparison Bar Chart */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold text-foreground mb-4">📊 Risk Category Comparison</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: "12px" }}
                />
                <Bar dataKey="High" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Moderate" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Low" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
