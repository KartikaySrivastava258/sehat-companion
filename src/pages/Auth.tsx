import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Heart, ArrowLeft, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });
const nameSchema = z.string().trim().min(1, { message: "Please enter your name" }).max(100);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (!isLogin) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const friendlyError = (err: any): { title: string; description: string } => {
    const code = err?.code || err?.error_code || "";
    const msg = (err?.message || "").toLowerCase();

    if (code === "invalid_credentials" || msg.includes("invalid login")) {
      return { title: "Incorrect email or password", description: "Double-check your details and try again. If you forgot your password, you can reset it." };
    }
    if (code === "email_not_confirmed" || msg.includes("not confirmed")) {
      return { title: "Email not confirmed yet", description: "We sent you a confirmation link. Please open it from your inbox — or tap ‘Resend confirmation email’ below." };
    }
    if (code === "user_already_exists" || msg.includes("already registered") || msg.includes("already been registered")) {
      return { title: "Account already exists", description: "This email is already registered. Try signing in instead, or reset your password." };
    }
    if (code === "weak_password" || msg.includes("password should")) {
      return { title: "Password too weak", description: "Use at least 6 characters. Mixing letters, numbers and a symbol makes it stronger." };
    }
    if (code === "over_email_send_rate_limit" || msg.includes("rate limit") || msg.includes("after ")) {
      return { title: "Please wait a moment", description: "Too many attempts in a short time. Wait a few seconds and try again." };
    }
    if (code === "email_address_invalid" || msg.includes("invalid email")) {
      return { title: "Invalid email", description: "That email address doesn’t look right. Please check for typos." };
    }
    if (code === "signup_disabled") {
      return { title: "Sign-ups are disabled", description: "New account creation is currently turned off. Please contact support." };
    }
    if (msg.includes("network") || msg.includes("failed to fetch")) {
      return { title: "Network issue", description: "We couldn’t reach our servers. Check your internet connection and try again." };
    }
    return { title: isLogin ? "Login failed" : "Sign up failed", description: err?.message || "Something went wrong. Please try again." };
  };

  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      toast({ title: "Enter your email", description: "Type the email you signed up with, then tap resend.", variant: "destructive" });
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setResending(false);
    if (error) {
      const f = friendlyError(error);
      toast({ title: f.title, description: f.description, variant: "destructive" });
    } else {
      toast({ title: "Confirmation email sent", description: "Check your inbox (and spam folder) for the verification link." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setNeedsConfirmation(false);

    try {
      if (isLogin) {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          const isUnconfirmed =
            (error as any)?.code === "email_not_confirmed" ||
            (error.message || "").toLowerCase().includes("not confirmed");
          if (isUnconfirmed) setNeedsConfirmation(true);
          const f = friendlyError(error);
          toast({ title: f.title, description: f.description, variant: "destructive" });
        } else {
          toast({ title: "Welcome back!", description: "You have successfully logged in." });
          navigate("/");
        }
      } else {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          const f = friendlyError(error);
          toast({ title: f.title, description: f.description, variant: "destructive" });
        } else {
          toast({ title: "Account created!", description: "Welcome to SehatGuardian. You are now logged in." });
          navigate("/");
        }
      }
    } catch (error) {
      toast({
        title: "Unexpected error",
        description: "Something went wrong on our side. Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 border-b border-border/50">
        <div className="container flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-foreground">SehatGuardian</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Sign in to access your health history"
                : "Start tracking your health journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>

              {needsConfirmation && isLogin && (
                <div className="rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <MailCheck className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      Your email isn’t confirmed yet. Check your inbox for the verification link, or resend it below.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleResendConfirmation}
                    disabled={resending}
                  >
                    {resending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    ) : (
                      "Resend confirmation email"
                    )}
                  </Button>
                </div>
              )}
            </form>


            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
