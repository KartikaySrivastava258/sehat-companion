import { useState, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingDown, TrendingUp, Minus, GitCompareArrows } from "lucide-react";

interface Assessment {
  id: string;
  diabetes_risk_score: number;
  bp_risk_score: number;
  confidence_level: string;
  created_at: string;
}

interface AssessmentComparisonProps {
  assessments: Assessment[];
}

export function AssessmentComparison({ assessments }: AssessmentComparisonProps) {
  const [selectedA, setSelectedA] = useState<string>(assessments.length > 1 ? assessments[assessments.length - 1].id : "");
  const [selectedB, setSelectedB] = useState<string>(assessments.length > 0 ? assessments[0].id : "");

  const comparison = useMemo(() => {
    const a = assessments.find(x => x.id === selectedA);
    const b = assessments.find(x => x.id === selectedB);
    if (!a || !b) return null;

    const diabetesDiff = b.diabetes_risk_score - a.diabetes_risk_score;
    const bpDiff = b.bp_risk_score - a.bp_risk_score;
    const daysBetween = Math.abs(differenceInDays(new Date(b.created_at), new Date(a.created_at)));

    return { a, b, diabetesDiff, bpDiff, daysBetween };
  }, [selectedA, selectedB, assessments]);

  if (assessments.length < 2) return null;

  const getTrendInfo = (diff: number) => {
    if (diff < 0) return { icon: TrendingDown, color: "text-green-500", label: "Improved", bg: "bg-green-500/10" };
    if (diff > 0) return { icon: TrendingUp, color: "text-destructive", label: "Increased", bg: "bg-destructive/10" };
    return { icon: Minus, color: "text-muted-foreground", label: "No change", bg: "bg-muted" };
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          Compare Assessments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">From (Older)</p>
            <Select value={selectedA} onValueChange={setSelectedA}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessments.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {format(new Date(a.created_at), "MMM d, yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">To (Newer)</p>
            <Select value={selectedB} onValueChange={setSelectedB}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessments.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {format(new Date(a.created_at), "MMM d, yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {comparison && (
          <div className="space-y-4">
            <p className="text-xs text-center text-muted-foreground">
              {comparison.daysBetween} days between assessments
            </p>

            {[
              { label: "Diabetes Risk", from: comparison.a.diabetes_risk_score, to: comparison.b.diabetes_risk_score, diff: comparison.diabetesDiff },
              { label: "BP Risk", from: comparison.a.bp_risk_score, to: comparison.b.bp_risk_score, diff: comparison.bpDiff },
            ].map(({ label, from, to, diff }) => {
              const trend = getTrendInfo(diff);
              const TrendIcon = trend.icon;
              return (
                <div key={label} className={`p-4 rounded-xl ${trend.bg} border border-border/50`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${trend.color}`}>
                      <TrendIcon className="h-4 w-4" />
                      {diff > 0 ? "+" : ""}{diff}%
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{from}%</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium text-foreground">{to}%</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${trend.bg} ${trend.color} font-medium`}>
                      {trend.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
