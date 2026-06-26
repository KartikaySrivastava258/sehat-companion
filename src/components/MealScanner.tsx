import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, ArrowLeft, Utensils, AlertTriangle } from "lucide-react";
import { MealAnalysisResult } from "./MealAnalysisResult";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { VoiceInput } from "./VoiceInput";
import { useLanguage } from "@/contexts/LanguageContext";

interface MealScannerProps {
  onBack: () => void;
}

interface MealAnalysis {
  mealName: string;
  carbImpact: { level: string; explanation: string };
  saltImpact: { level: string; explanation: string };
  diabetesRelevance: string;
  bpRelevance: string;
  healthierSwaps: { original: string; swap: string; benefit: string }[];
  overallTip: string;
}

export function MealScanner({ onBack }: MealScannerProps) {
  const [mealDescription, setMealDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const handleVoiceTranscript = (text: string) => {
    setMealDescription((prev) => prev ? `${prev} ${text}` : text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: t("common.error"), description: t("lab.fileSize"), variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!mealDescription.trim() && !imagePreview) {
      toast({ title: t("common.error"), description: t("meal.describeMeal"), variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-meal", {
        body: { mealDescription: mealDescription.trim() || undefined, imageBase64: imagePreview || undefined },
      });
      if (error) throw new Error(error.message || "Failed to analyze meal");
      if (data.error) throw new Error(data.error);
      setAnalysis(data);

      if (user) {
        await supabase.from("meal_scans").insert({
          user_id: user.id, meal_description: mealDescription.trim() || null, analysis: data,
        });
      }
    } catch (error) {
      console.error("Meal analysis error:", error);
      toast({ title: t("common.error"), description: error instanceof Error ? error.message : t("common.error"), variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setMealDescription("");
    setImagePreview(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="py-12">
      <div className="container max-w-3xl">
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t("common.backToHome")}
        </Button>

        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Utensils className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">{t("meal.title")}</h1>
          <p className="text-muted-foreground">{t("meal.describeOrPhoto")}</p>
        </div>

        {!analysis ? (
          <Card variant="elevated" className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">{t("meal.analyzeYourMeal")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("meal.uploadPhoto")}</label>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Meal preview" className="w-full h-48 object-cover rounded-xl" />
                    <Button variant="secondary" size="sm" className="absolute top-2 right-2" onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                      {t("common.remove")}
                    </Button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex justify-center gap-4 mb-3">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t("meal.tapToPhoto")}</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">{t("meal.describeMeal")}</label>
                  <VoiceInput onTranscript={handleVoiceTranscript} language={language} disabled={isAnalyzing} />
                </div>
                <Textarea placeholder={t("meal.placeholder")} value={mealDescription} onChange={(e) => setMealDescription(e.target.value)} className="min-h-[100px] resize-none" />
                <p className="text-xs text-muted-foreground mt-1">{t("meal.voiceTip")}</p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{t("meal.disclaimerText")}</p>
              </div>

              <Button variant="hero" onClick={handleAnalyze} disabled={isAnalyzing || (!mealDescription.trim() && !imagePreview)} className="w-full">
                {isAnalyzing ? (<><Loader2 className="w-4 h-4 animate-spin" />{t("meal.analyzing")}</>) : (<><Utensils className="w-4 h-4" />{t("meal.analyze")}</>)}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <MealAnalysisResult analysis={analysis} onReset={handleReset} />
        )}
      </div>
    </section>
  );
}
