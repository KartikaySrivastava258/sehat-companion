import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, FileText, Loader2, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LabReportResult } from "./LabReportResult";
import { useAuth } from "@/hooks/useAuth";
import { VoiceInput } from "./VoiceInput";
import { useLanguage } from "@/contexts/LanguageContext";

interface LabReportDecoderProps {
  onBack: () => void;
}

export const LabReportDecoder = ({ onBack }: LabReportDecoderProps) => {
  const [reportText, setReportText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const handleVoiceTranscript = (text: string) => {
    setReportText((prev) => prev ? `${prev} ${text}` : text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("common.error"), description: t("lab.fileSize"), variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => { setImagePreview(null); setImageBase64(null); };

  const handleAnalyze = async () => {
    if (!reportText.trim() && !imageBase64) {
      toast({ title: t("common.error"), description: t("lab.orTypeValues"), variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("decode-lab-report", {
        body: { reportText: reportText.trim(), imageBase64 },
      });
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);

      if (user) {
        await supabase.from("lab_reports").insert({
          user_id: user.id, report_text: reportText.trim() || null, analysis: data.analysis,
        });
      }
    } catch (error) {
      console.error("Error analyzing lab report:", error);
      toast({ title: t("common.error"), description: error instanceof Error ? error.message : t("common.error"), variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setReportText("");
    setImagePreview(null);
    setImageBase64(null);
    setAnalysis(null);
  };

  return (
    <section className="py-8">
      <div className="container max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{t("lab.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("lab.understandResults")}</p>
          </div>
        </div>

        {!analysis ? (
          <div className="space-y-6">
            <Card variant="bordered" className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">{t("lab.howToUse")}</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• {t("lab.howToUse1")}</li>
                      <li>• {t("lab.howToUse2")}</li>
                      <li>• {t("lab.howToUse3")}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" />
                  {t("lab.uploadReportImage")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Lab report preview" className="w-full max-h-64 object-contain rounded-xl bg-muted" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full w-8 h-8" onClick={clearImage}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">{t("lab.clickUpload")}</span>
                    <span className="text-xs text-muted-foreground mt-1">{t("lab.fileSize")}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {t("lab.orTypeValues")}
                  </CardTitle>
                  <VoiceInput onTranscript={handleVoiceTranscript} language={language} disabled={isAnalyzing} />
                </div>
              </CardHeader>
              <CardContent>
                <Textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder={t("lab.placeholder")} className="min-h-[160px] resize-none" />
                <p className="text-xs text-muted-foreground mt-2">{t("lab.voiceTip")}</p>
              </CardContent>
            </Card>

            <Button onClick={handleAnalyze} disabled={isAnalyzing || (!reportText.trim() && !imageBase64)} className="w-full" size="lg">
              {isAnalyzing ? (<><Loader2 className="w-5 h-5 animate-spin" />{t("lab.analyzingReport")}</>) : (<><FileText className="w-5 h-5" />{t("lab.decodeMyReport")}</>)}
            </Button>

            <p className="text-xs text-center text-muted-foreground">{t("lab.securityNote")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <LabReportResult analysis={analysis} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">{t("lab.analyzeAnother")}</Button>
              <Button variant="outline" onClick={onBack} className="flex-1">{t("common.backToHome")}</Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
