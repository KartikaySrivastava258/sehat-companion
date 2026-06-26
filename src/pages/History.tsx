import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Activity, Utensils, FileText, Loader2, Calendar, TrendingUp, TrendingDown, Minus, Download } from "lucide-react";
import { Header } from "@/components/Header";
import { HealthTrendChart } from "@/components/HealthTrendChart";
import { AssessmentComparison } from "@/components/AssessmentComparison";
import { format } from "date-fns";
import { generateHealthPDF } from "@/utils/generateHealthPDF";
import { toast } from "sonner";


interface Assessment {
  id: string;
  diabetes_risk_score: number;
  bp_risk_score: number;
  confidence_level: string;
  created_at: string;
  assessment_data?: any;
}

interface MealScan {
  id: string;
  meal_description: string | null;
  analysis: any;
  created_at: string;
}

interface LabReport {
  id: string;
  report_text: string | null;
  analysis: any;
  created_at: string;
}

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [mealScans, setMealScans] = useState<MealScan[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (assessments.length === 0 && mealScans.length === 0 && labReports.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    setExporting(true);
    try {
      generateHealthPDF({
        assessments,
        mealScans,
        labReports,
        userName: user?.email,
      });
      toast.success("PDF report downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [assessmentsRes, mealScansRes, labReportsRes] = await Promise.all([
        supabase
          .from("assessments")
          .select("id, diabetes_risk_score, bp_risk_score, confidence_level, created_at, assessment_data")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("meal_scans")
          .select("id, meal_description, analysis, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("lab_reports")
          .select("id, report_text, analysis, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (assessmentsRes.data) setAssessments(assessmentsRes.data);
      if (mealScansRes.data) setMealScans(mealScansRes.data);
      if (labReportsRes.data) setLabReports(labReportsRes.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-success";
    if (score < 60) return "text-warning";
    return "text-danger";
  };

  const getTrendIcon = (current: number, previous: number | undefined) => {
    if (previous === undefined) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-success" />;
    if (current > previous) return <TrendingUp className="w-4 h-4 text-danger" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Health History</h1>
                <p className="text-muted-foreground text-sm">Track your progress over time</p>
              </div>
            </div>
            <Button 
              onClick={handleExportPDF} 
              disabled={exporting || (assessments.length === 0 && mealScans.length === 0 && labReports.length === 0)}
              className="gap-2"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export PDF
            </Button>
          </div>

          <Tabs defaultValue="assessments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assessments" className="gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Assessments</span>
              </TabsTrigger>
              <TabsTrigger value="meals" className="gap-2">
                <Utensils className="w-4 h-4" />
                <span className="hidden sm:inline">Meal Scans</span>
              </TabsTrigger>
              <TabsTrigger value="labs" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Lab Reports</span>
              </TabsTrigger>
            </TabsList>

            {/* Assessments Tab */}
            <TabsContent value="assessments" className="space-y-4">
              {assessments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">No assessments yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete your first health assessment to start tracking
                    </p>
                    <Link to="/">
                      <Button>Start Assessment</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <HealthTrendChart assessments={assessments} />
                  <AssessmentComparison assessments={assessments} />
                  {assessments.map((assessment, index) => (
                  <Card key={assessment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(assessment.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                        <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                          {assessment.confidence_level} confidence
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Diabetes Risk</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg ${getRiskColor(assessment.diabetes_risk_score)}`}>
                              {assessment.diabetes_risk_score}%
                            </span>
                            {getTrendIcon(assessment.diabetes_risk_score, assessments[index + 1]?.diabetes_risk_score)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">BP Risk</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg ${getRiskColor(assessment.bp_risk_score)}`}>
                              {assessment.bp_risk_score}%
                            </span>
                            {getTrendIcon(assessment.bp_risk_score, assessments[index + 1]?.bp_risk_score)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </>
              )}
            </TabsContent>

            {/* Meal Scans Tab */}
            <TabsContent value="meals" className="space-y-4">
              {mealScans.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">No meal scans yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Scan your first meal to get nutrition insights
                    </p>
                    <Link to="/">
                      <Button>Scan a Meal</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                mealScans.map((scan) => (
                  <Card key={scan.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(scan.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      {scan.meal_description && (
                        <p className="text-foreground font-medium mb-2">{scan.meal_description}</p>
                      )}
                      {scan.analysis && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-secondary/50 rounded-lg">
                            <span className="text-muted-foreground">Carb Impact: </span>
                            <span className="text-foreground font-medium">{typeof scan.analysis.carbImpact === "object" ? scan.analysis.carbImpact?.level : scan.analysis.carbImpact}</span>
                          </div>
                          <div className="p-2 bg-secondary/50 rounded-lg">
                            <span className="text-muted-foreground">Salt Impact: </span>
                            <span className="text-foreground font-medium">{typeof scan.analysis.saltImpact === "object" ? scan.analysis.saltImpact?.level : scan.analysis.saltImpact}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Lab Reports Tab */}
            <TabsContent value="labs" className="space-y-4">
              {labReports.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">No lab reports yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload your first lab report to get explanations
                    </p>
                    <Link to="/">
                      <Button>Decode a Report</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                labReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(report.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      {report.analysis?.overallSummary && (
                        <p className="text-foreground text-sm">{report.analysis.overallSummary}</p>
                      )}
                      {report.analysis?.labValues && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {report.analysis.labValues.length} values analyzed
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
    </div>
  );
};

export default History;
