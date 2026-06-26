import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";

interface Props {
  institutionId: string;
}

interface DeptData {
  department: string;
  count: number;
  avg_diabetes: number;
  avg_bp: number;
}

export function CampusHeatmap({ institutionId }: Props) {
  const [deptData, setDeptData] = useState<DeptData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeptData();
  }, [institutionId]);

  const fetchDeptData = async () => {
    const { data: members } = await supabase
      .from("institution_members")
      .select("user_id, department")
      .eq("institution_id", institutionId);

    if (!members || members.length === 0) { setLoading(false); return; }

    const deptMap = new Map<string, string[]>();
    members.forEach((m) => {
      const dept = m.department || "Unassigned";
      if (!deptMap.has(dept)) deptMap.set(dept, []);
      deptMap.get(dept)!.push(m.user_id);
    });

    const userIds = members.map((m) => m.user_id);
    const { data: assessments } = await supabase
      .from("assessments")
      .select("user_id, diabetes_risk_score, bp_risk_score")
      .in("user_id", userIds)
      .order("created_at", { ascending: false });

    const latestByUser = new Map<string, { diabetes: number; bp: number }>();
    assessments?.forEach((a) => {
      if (!latestByUser.has(a.user_id)) {
        latestByUser.set(a.user_id, { diabetes: a.diabetes_risk_score, bp: a.bp_risk_score });
      }
    });

    const result: DeptData[] = [];
    deptMap.forEach((uids, dept) => {
      const scores = uids.filter((id) => latestByUser.has(id)).map((id) => latestByUser.get(id)!);
      if (scores.length > 0) {
        result.push({
          department: dept,
          count: scores.length,
          avg_diabetes: Math.round(scores.reduce((s, v) => s + v.diabetes, 0) / scores.length),
          avg_bp: Math.round(scores.reduce((s, v) => s + v.bp, 0) / scores.length),
        });
      }
    });

    setDeptData(result);
    setLoading(false);
  };

  const getHeatBg = (score: number) => {
    if (score >= 60) return "bg-destructive/10 border-destructive/30";
    if (score >= 40) return "bg-warning/10 border-warning/30";
    return "bg-success/10 border-success/30";
  };

  const getHeatText = (score: number) => {
    if (score >= 60) return "text-destructive";
    if (score >= 40) return "text-warning";
    return "text-success";
  };

  const getLevelLabel = (score: number) => {
    if (score >= 60) return "High";
    if (score >= 40) return "Moderate";
    return "Low";
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (deptData.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Department Data</h3>
        <p className="text-muted-foreground text-sm">Members need to set their department when joining and take assessments.</p>
      </Card>
    );
  }

  const chartData = deptData.map(d => ({
    name: d.department.length > 12 ? d.department.slice(0, 12) + "…" : d.department,
    "Diabetes Risk": d.avg_diabetes,
    "BP Risk": d.avg_bp,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-3">
          <MapPin className="w-4 h-4" />
          Department Analytics
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Campus Wellness Heatmap</h2>
        <p className="text-sm text-muted-foreground">Health indicators across departments — anonymous data only</p>
      </div>

      {/* Bar Chart Comparison */}
      {deptData.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold text-foreground mb-4">Department Risk Comparison</h4>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="Diabetes Risk" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="BP Risk" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Department Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deptData.map((d, i) => {
          const avgRisk = Math.round((d.avg_diabetes + d.avg_bp) / 2);
          return (
            <Card key={d.department} className="group hover:shadow-md transition-all duration-300 animate-fade-in overflow-hidden" style={{ animationDelay: `${i * 80}ms` }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">{d.department}</h4>
                  <Badge variant="outline" className="text-xs">{d.count} students</Badge>
                </div>
                <div className="space-y-2">
                  <div className={`rounded-xl border p-3 ${getHeatBg(d.avg_diabetes)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">🍬 Diabetes Risk</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getHeatText(d.avg_diabetes)}`}>{d.avg_diabetes}%</span>
                        <Badge variant="outline" className={`text-xs ${getHeatText(d.avg_diabetes)}`}>{getLevelLabel(d.avg_diabetes)}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className={`rounded-xl border p-3 ${getHeatBg(d.avg_bp)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">❤️ BP Risk</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getHeatText(d.avg_bp)}`}>{d.avg_bp}%</span>
                        <Badge variant="outline" className={`text-xs ${getHeatText(d.avg_bp)}`}>{getLevelLabel(d.avg_bp)}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
