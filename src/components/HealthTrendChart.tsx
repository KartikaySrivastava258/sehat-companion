import { useMemo } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface Assessment {
  id: string;
  diabetes_risk_score: number;
  bp_risk_score: number;
  confidence_level: string;
  created_at: string;
}

interface HealthTrendChartProps {
  assessments: Assessment[];
}

export function HealthTrendChart({ assessments }: HealthTrendChartProps) {
  const chartData = useMemo(() => {
    return [...assessments]
      .reverse()
      .map((a) => ({
        date: format(new Date(a.created_at), "MMM d"),
        fullDate: format(new Date(a.created_at), "MMM d, yyyy"),
        diabetes: a.diabetes_risk_score,
        bp: a.bp_risk_score,
      }));
  }, [assessments]);

  const trend = useMemo(() => {
    if (assessments.length < 2) return { diabetes: "neutral", bp: "neutral" };
    
    const latest = assessments[0];
    const oldest = assessments[assessments.length - 1];
    
    return {
      diabetes: latest.diabetes_risk_score < oldest.diabetes_risk_score 
        ? "improving" 
        : latest.diabetes_risk_score > oldest.diabetes_risk_score 
          ? "worsening" 
          : "neutral",
      bp: latest.bp_risk_score < oldest.bp_risk_score 
        ? "improving" 
        : latest.bp_risk_score > oldest.bp_risk_score 
          ? "worsening" 
          : "neutral",
    };
  }, [assessments]);

  const TrendIndicator = ({ type, label }: { type: "improving" | "worsening" | "neutral"; label: string }) => {
    const config = {
      improving: { icon: TrendingDown, color: "text-success", text: "Improving" },
      worsening: { icon: TrendingUp, color: "text-danger", text: "Needs attention" },
      neutral: { icon: Minus, color: "text-muted-foreground", text: "Stable" },
    };
    
    const { icon: Icon, color, text } = config[type];
    
    return (
      <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
        <Icon className={`w-5 h-5 ${color}`} />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-sm font-medium ${color}`}>{text}</p>
        </div>
      </div>
    );
  };

  if (assessments.length < 2) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">Health Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <TrendIndicator type={trend.diabetes as any} label="Diabetes Risk" />
          <TrendIndicator type={trend.bp as any} label="Blood Pressure Risk" />
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelFormatter={(_, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullDate;
                  }
                  return "";
                }}
                formatter={(value: number) => [`${value}%`]}
              />
              <Legend 
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
              <Line
                type="monotone"
                dataKey="diabetes"
                name="Diabetes Risk"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--warning))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="bp"
                name="BP Risk"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          Based on your last {assessments.length} assessments
        </p>
      </CardContent>
    </Card>
  );
}
