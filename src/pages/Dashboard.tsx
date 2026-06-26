import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { 
  ArrowLeft, 
  Loader2, 
  Target, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles,
  Heart,
  Activity,
  Utensils,
  Moon
} from "lucide-react";

interface ImprovementTask {
  id: string;
  task_text: string;
  category: string;
  is_completed: boolean;
  completed_at: string | null;
  risk_reduction_points: number;
  created_at: string;
}

interface AssessmentSummary {
  id: string;
  diabetes_risk_score: number;
  bp_risk_score: number;
  created_at: string;
  action_plan: {
    text: string;
    category: string;
  }[] | null;
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<ImprovementTask[]>([]);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch improvement tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("improvement_tasks")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      // Fetch assessments for summary
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessments")
        .select("id, diabetes_risk_score, bp_risk_score, created_at, action_plan")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (assessmentsError) throw assessmentsError;
      
      // Type-cast action_plan properly
      const typedAssessments = (assessmentsData || []).map(a => ({
        ...a,
        action_plan: a.action_plan as AssessmentSummary['action_plan']
      }));
      setAssessments(typedAssessments);

      // If no tasks exist but we have assessments with action plans, create tasks
      if ((!tasksData || tasksData.length === 0) && assessmentsData && assessmentsData.length > 0) {
        await createTasksFromAssessment(assessmentsData[0]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTasksFromAssessment = async (assessment: any) => {
    if (!assessment.action_plan || !Array.isArray(assessment.action_plan)) return;

    const newTasks = assessment.action_plan.map((action: any) => ({
      user_id: user!.id,
      assessment_id: assessment.id,
      task_text: action.text,
      category: action.category || 'lifestyle',
      risk_reduction_points: 5,
    }));

    const { data, error } = await supabase
      .from("improvement_tasks")
      .insert(newTasks)
      .select();

    if (error) {
      console.error("Error creating tasks:", error);
    } else {
      setTasks(data || []);
    }
  };

  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    setUpdatingTask(taskId);
    try {
      const { error } = await supabase
        .from("improvement_tasks")
        .update({
          is_completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, is_completed: !currentStatus, completed_at: !currentStatus ? new Date().toISOString() : null }
            : task
        )
      );

      if (!currentStatus) {
        toast({
          title: "Task Completed! 🎉",
          description: "Great job on improving your health!",
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    } finally {
      setUpdatingTask(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "diet":
        return <Utensils className="h-4 w-4" />;
      case "exercise":
        return <Activity className="h-4 w-4" />;
      case "lifestyle":
        return <Moon className="h-4 w-4" />;
      case "monitoring":
        return <Heart className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "diet":
        return "text-green-500 bg-green-500/10";
      case "exercise":
        return "text-blue-500 bg-blue-500/10";
      case "lifestyle":
        return "text-purple-500 bg-purple-500/10";
      case "monitoring":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-accent bg-accent/10";
    }
  };

  // Calculate progress
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalPointsEarned = tasks.filter(t => t.is_completed).reduce((sum, t) => sum + t.risk_reduction_points, 0);

  // Calculate risk reduction (mock calculation based on completed tasks)
  const latestAssessment = assessments[0];
  const estimatedRiskReduction = Math.min(totalPointsEarned * 0.5, 25); // Max 25% reduction

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="container py-8" data-voice-content>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Health Dashboard</h1>
            <p className="text-muted-foreground">Track your progress and improve your health</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold text-foreground">{completedTasks} / {totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <TrendingDown className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Risk Reduction</p>
                  <p className="text-2xl font-bold text-foreground">{estimatedRiskReduction.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/20">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                  <p className="text-2xl font-bold text-foreground">{totalPointsEarned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Journey Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Your Health Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium text-foreground">{progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
              
              {latestAssessment && (
                <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Latest Diabetes Risk</p>
                    <p className="text-xl font-bold text-foreground">{latestAssessment.diabetes_risk_score}%</p>
                    {estimatedRiskReduction > 0 && (
                      <p className="text-xs text-green-500 mt-1">↓ {estimatedRiskReduction.toFixed(1)}% potential reduction</p>
                    )}
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Latest BP Risk</p>
                    <p className="text-xl font-bold text-foreground">{latestAssessment.bp_risk_score}%</p>
                    {estimatedRiskReduction > 0 && (
                      <p className="text-xs text-green-500 mt-1">↓ {estimatedRiskReduction.toFixed(1)}% potential reduction</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Improvement Tasks */}
        <Card className="action-plan-content">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Improvement Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete a health assessment to get personalized improvement tasks.
                </p>
                <Button onClick={() => navigate("/")}>
                  Take Assessment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      task.is_completed
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-secondary/50 border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="pt-0.5">
                      {updatingTask === task.id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <Checkbox
                          checked={task.is_completed}
                          onCheckedChange={() => handleTaskToggle(task.id, task.is_completed)}
                          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-foreground ${task.is_completed ? "line-through opacity-60" : ""}`}>
                        {task.task_text}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                          {getCategoryIcon(task.category)}
                          {task.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          +{task.risk_reduction_points} points
                        </span>
                      </div>
                    </div>
                    {task.is_completed && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      
    </div>
  );
};

export default Dashboard;
