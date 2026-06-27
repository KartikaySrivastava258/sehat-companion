import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Loader2, Building2, Users, Plus, Copy, ArrowLeft, ShieldCheck,
  TrendingUp, TrendingDown, Brain, Heart, Activity, Megaphone,
  BookOpen, MapPin, FileText, Sparkles, AlertTriangle, BarChart3
} from "lucide-react";
import { generateInstitutionPDF } from "@/utils/generateInstitutionPDF";
import { InstitutionHealthSnapshot } from "@/components/institution/HealthSnapshot";
import { CampusWellnessScore } from "@/components/institution/CampusWellnessScore";
import { AICampaignGenerator } from "@/components/institution/AICampaignGenerator";
import { WellnessProgramRecs } from "@/components/institution/WellnessProgramRecs";
import { CampusHeatmap } from "@/components/institution/CampusHeatmap";
import { PredictiveAlerts } from "@/components/institution/PredictiveAlerts";
import { PrivacyNotice } from "@/components/institution/PrivacyNotice";

interface Institution {
  id: string;
  name: string;
  type: string;
  admin_user_id: string;
  invite_code: string;
  created_at: string;
}

interface HealthStats {
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
}

const InstitutionDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("college");
  const [joinCode, setJoinCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinDepartment, setJoinDepartment] = useState("");

  const isDesignatedAdmin = user?.email === "kartikayadmin@gmail.com";

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchInstitution();
  }, [user]);

  const fetchInstitution = async () => {
    setLoading(true);
    // Check if user is admin of any institution
    const { data: adminInst } = await supabase
      .from("institutions")
      .select("*")
      .eq("admin_user_id", user!.id)
      .limit(1)
      .maybeSingle();

    if (adminInst) {
      setInstitution(adminInst);
      await fetchStats(adminInst.id);
      await fetchMemberCount(adminInst.id);
    } else {
      // Check if user is member of any institution
      const { data: membership } = await supabase
        .from("institution_members")
        .select("institution_id")
        .eq("user_id", user!.id)
        .limit(1)
        .maybeSingle();

      if (membership) {
        const { data: inst } = await supabase
          .from("institutions")
          .select("*")
          .eq("id", membership.institution_id)
          .single();
        if (inst) {
          setInstitution(inst);
          // Members can't see stats (admin only)
        }
      }
    }
    setLoading(false);
  };

  const fetchStats = async (instId: string) => {
    const { data, error } = await supabase.rpc("get_institution_health_stats", {
      inst_id: instId,
    });
    if (data && !error) setStats(data as unknown as HealthStats);
  };

  const fetchMemberCount = async (instId: string) => {
    const { count } = await supabase
      .from("institution_members")
      .select("*", { count: "exact", head: true })
      .eq("institution_id", instId);
    setMemberCount(count || 0);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("institutions")
      .insert({ name: newName.trim(), type: newType, admin_user_id: user!.id })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setInstitution(data);
      setStats({ total_assessed: 0, avg_diabetes_risk: 0, avg_bp_risk: 0, diabetes_high: 0, diabetes_moderate: 0, diabetes_low: 0, bp_high: 0, bp_moderate: 0, bp_low: 0, total_assessments: 0 });
      toast({ title: "Institution Created!", description: `Share code: ${data.invite_code}` });
    }
    setCreating(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    const { data: lookup } = await supabase.rpc("lookup_institution_by_invite", {
      _code: joinCode.trim(),
    });
    const inst = Array.isArray(lookup) ? lookup[0] : lookup;

    if (!inst) {
      toast({ title: "Invalid Code", description: "No institution found with this code.", variant: "destructive" });
      setJoining(false);
      return;
    }

    const { error } = await supabase
      .from("institution_members")
      .insert({ institution_id: inst.id, user_id: user!.id, department: joinDepartment.trim() || null });

    if (error) {
      toast({ title: "Error", description: error.message.includes("duplicate") ? "You're already a member." : error.message, variant: "destructive" });
    } else {
      toast({ title: "Joined!", description: `You joined ${inst.name}` });
      fetchInstitution();
    }
    setJoining(false);
  };

  const copyInviteCode = () => {
    if (institution?.invite_code) {
      navigator.clipboard.writeText(institution.invite_code);
      toast({ title: "Copied!", description: "Invite code copied to clipboard." });
    }
  };

  const isAdmin = institution?.admin_user_id === user?.id;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No institution — show create/join
  if (!institution) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-12">
          <div className="container max-w-2xl">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
                <Building2 className="w-4 h-4" />
                Campus Preventive Health Intelligence
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Institution Dashboard</h1>
              <p className="text-muted-foreground">
                {isDesignatedAdmin
                  ? "Monitor campus wellness anonymously. Create or join an institution."
                  : "Join your institution using the invite code shared by your admin."}
              </p>
            </div>

            <div className={`grid ${isDesignatedAdmin ? "sm:grid-cols-2" : "sm:grid-cols-1 max-w-md mx-auto"} gap-6`}>
              {isDesignatedAdmin && (
                <Card variant="elevated" className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setShowCreate(true); setShowJoin(false); }}>
                  <CardHeader className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Plus className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Create Institution</CardTitle>
                    <CardDescription>Set up a new campus dashboard as admin</CardDescription>
                  </CardHeader>
                </Card>
              )}

              <Card variant="elevated" className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => { setShowJoin(true); setShowCreate(false); }}>
                <CardHeader className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
                    <Users className="w-7 h-7 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Join Institution</CardTitle>
                  <CardDescription>Enter an invite code from your institution</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {isDesignatedAdmin && showCreate && (
              <Card className="mt-6 animate-fade-in">
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Institution Name</label>
                    <Input placeholder="e.g. Graphic Era University" value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Type</label>
                    <div className="flex gap-2 mt-1">
                      {["college", "school", "ngo", "corporate"].map((t) => (
                        <Badge key={t} variant={newType === t ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setNewType(t)}>
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleCreate} disabled={creating || !newName.trim()} className="w-full gap-2">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create Institution
                  </Button>
                </CardContent>
              </Card>
            )}

            {showJoin && (
              <Card className="mt-6 animate-fade-in">
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Invite Code</label>
                    <Input placeholder="e.g. a1b2c3d4" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Department</label>
                    <Input placeholder="e.g. Computer Science, Management, Hostel A" value={joinDepartment} onChange={(e) => setJoinDepartment(e.target.value)} className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Used for anonymous campus heatmap — your identity stays private</p>
                  </div>
                  <Button onClick={handleJoin} disabled={joining || !joinCode.trim()} className="w-full gap-2">
                    {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    Join Institution
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Institution exists — show dashboard
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 mb-2 -ml-3">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">{institution.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="capitalize">{institution.type}</Badge>
                    <span>•</span>
                    <span>{memberCount} members</span>
                    {isAdmin && (
                      <>
                        <span>•</span>
                        <button onClick={copyInviteCode} className="inline-flex items-center gap-1 text-primary hover:underline">
                          <Copy className="w-3 h-3" /> Code: {institution.invite_code}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                {stats && stats.total_assessments > 0 && (
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => generateInstitutionPDF(institution.name, stats, memberCount)}>
                    <FileText className="w-4 h-4" /> Export PDF
                  </Button>
                )}
                <Badge className="gap-1"><ShieldCheck className="w-3 h-3" /> Admin</Badge>
              </div>
            )}
          </div>

          {!isAdmin ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Member Access</h2>
              <p className="text-muted-foreground mb-4">You're a member of this institution. The dashboard analytics are only visible to administrators to protect student privacy.</p>
              <p className="text-sm text-muted-foreground">Your assessment data contributes anonymously to the campus wellness insights.</p>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto">
                <TabsTrigger value="overview" className="gap-1 text-xs"><BarChart3 className="w-3.5 h-3.5" /> Overview</TabsTrigger>
                <TabsTrigger value="score" className="gap-1 text-xs"><Activity className="w-3.5 h-3.5" /> Score</TabsTrigger>
                <TabsTrigger value="campaigns" className="gap-1 text-xs"><Megaphone className="w-3.5 h-3.5" /> Campaigns</TabsTrigger>
                <TabsTrigger value="programs" className="gap-1 text-xs"><BookOpen className="w-3.5 h-3.5" /> Programs</TabsTrigger>
                <TabsTrigger value="heatmap" className="gap-1 text-xs"><MapPin className="w-3.5 h-3.5" /> Heatmap</TabsTrigger>
                <TabsTrigger value="predictions" className="gap-1 text-xs"><Sparkles className="w-3.5 h-3.5" /> AI Alerts</TabsTrigger>
                <TabsTrigger value="privacy" className="gap-1 text-xs"><ShieldCheck className="w-3.5 h-3.5" /> Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <InstitutionHealthSnapshot stats={stats} memberCount={memberCount} />
              </TabsContent>

              <TabsContent value="score">
                <CampusWellnessScore stats={stats} institutionName={institution.name} />
              </TabsContent>

              <TabsContent value="campaigns">
                <AICampaignGenerator stats={stats} />
              </TabsContent>

              <TabsContent value="programs">
                <WellnessProgramRecs stats={stats} />
              </TabsContent>

              <TabsContent value="heatmap">
                <CampusHeatmap institutionId={institution.id} />
              </TabsContent>

              <TabsContent value="predictions">
                <PredictiveAlerts stats={stats} />
              </TabsContent>

              <TabsContent value="privacy">
                <PrivacyNotice />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default InstitutionDashboard;
