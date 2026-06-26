import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, User, MapPin, Activity, Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ValidatedNumberInput } from "@/components/ValidatedNumberInput";

export interface AssessmentData {
  age: string;
  gender: string;
  city: string;
  activityLevel: string;
  familyHistoryDiabetes: string;
  familyHistoryBP: string;
  sleepHours: number;
  stressLevel: string;
  dietType: string;
  smokingStatus: string;
  recentDiabetesTest?: string;
  lastBloodSugar?: string;
  alcoholConsumption: string;
  otherSubstances: string;
  weight?: number;
  height?: number;
}

interface AssessmentFormProps {
  onSubmit: (data: AssessmentData) => void;
}

const ageToAgeGroup = (age: number | null): string => {
  if (!age) return "";
  if (age >= 18 && age <= 25) return "18-25";
  if (age >= 26 && age <= 35) return "26-35";
  if (age >= 36 && age <= 45) return "36-45";
  if (age >= 46 && age <= 55) return "46-55";
  if (age >= 56 && age <= 65) return "56-65";
  if (age > 65) return "65+";
  return "";
};

const normalizeCity = (city: string | null): string => {
  if (!city) return "";
  const cityLower = city.toLowerCase();
  const cityMap: Record<string, string> = {
    "mumbai": "mumbai", "delhi": "delhi", "delhi ncr": "delhi", "new delhi": "delhi",
    "bangalore": "bangalore", "bengaluru": "bangalore", "chennai": "chennai",
    "kolkata": "kolkata", "hyderabad": "hyderabad", "pune": "pune", "ahmedabad": "ahmedabad",
  };
  return cityMap[cityLower] || (cityLower.includes("tier") ? "tier2" : "");
};

export function AssessmentForm({ onSubmit }: AssessmentFormProps) {
  const [step, setStep] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState<AssessmentData>({
    age: "", gender: "", city: "", activityLevel: "",
    familyHistoryDiabetes: "", familyHistoryBP: "", sleepHours: 7,
    stressLevel: "", dietType: "", smokingStatus: "",
    recentDiabetesTest: "", lastBloodSugar: "",
    alcoholConsumption: "", otherSubstances: "",
    weight: undefined, height: undefined,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) { setLoadingProfile(false); return; }
      try {
        const { data, error } = await supabase.from("profiles").select("age, gender, city").eq("user_id", user.id).single();
        if (data && !error) {
          setFormData(prev => ({
            ...prev,
            age: ageToAgeGroup(data.age) || prev.age,
            gender: data.gender?.toLowerCase() || prev.gender,
            city: normalizeCity(data.city) || prev.city,
          }));
        }
      } catch (err) { console.error("Error fetching profile:", err); }
      finally { setLoadingProfile(false); }
    };
    fetchProfile();
  }, [user]);

  const updateField = (field: keyof AssessmentData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) return formData.age && formData.gender && formData.city;
    if (step === 2) return formData.activityLevel && formData.sleepHours && formData.stressLevel;
    if (step === 3) return formData.familyHistoryDiabetes && formData.familyHistoryBP && formData.dietType && formData.smokingStatus && formData.alcoholConsumption && formData.otherSubstances;
    return false;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onSubmit(formData);
  };

  if (loadingProfile) {
    return (
      <Card variant="elevated" className="max-w-2xl mx-auto">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">{t("common.loading")}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="max-w-2xl mx-auto animate-fade-in">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-display">{t("assessment.title")}</CardTitle>
        <CardDescription>{t("assessment.answerQuestions")}</CardDescription>
        
        <div className="flex items-center justify-center gap-2 mt-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{s}</div>
              {s < 3 && (<div className={`w-12 h-0.5 mx-1 transition-colors ${step > s ? "bg-primary" : "bg-muted"}`} />)}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-primary mb-4">
              <User className="w-5 h-5" />
              <h3 className="font-medium">{t("assessment.basicInfo")}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="age">{t("assessment.ageGroup")}</Label>
                <Select value={formData.age} onValueChange={(v) => updateField("age", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.selectAgeGroup")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25 {t("assessment.years")}</SelectItem>
                    <SelectItem value="26-35">26-35 {t("assessment.years")}</SelectItem>
                    <SelectItem value="36-45">36-45 {t("assessment.years")}</SelectItem>
                    <SelectItem value="46-55">46-55 {t("assessment.years")}</SelectItem>
                    <SelectItem value="56-65">56-65 {t("assessment.years")}</SelectItem>
                    <SelectItem value="65+">65+ {t("assessment.years")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("assessment.genderLabel")}</Label>
                <RadioGroup value={formData.gender} onValueChange={(v) => updateField("gender", v)} className="flex gap-4 mt-1.5">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="font-normal cursor-pointer">{t("assessment.male")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="font-normal cursor-pointer">{t("assessment.female")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="font-normal cursor-pointer">{t("assessment.other")}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="city" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />{t("assessment.cityRegion")}
                </Label>
                <Select value={formData.city} onValueChange={(v) => updateField("city", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.selectCity")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi NCR</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="chennai">Chennai</SelectItem>
                    <SelectItem value="kolkata">Kolkata</SelectItem>
                    <SelectItem value="hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="pune">Pune</SelectItem>
                    <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                    <SelectItem value="tier2">Tier 2 City</SelectItem>
                    <SelectItem value="rural">Rural Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-4">{t("assessment.optionalBMI")}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">{t("assessment.weight")}</Label>
                    <ValidatedNumberInput id="weight" placeholder="e.g., 70" min={10} max={500} value={formData.weight ?? null} onChange={(val) => updateField("weight", val ?? (undefined as any))} />
                  </div>
                  <div>
                    <Label htmlFor="height">{t("assessment.height")}</Label>
                    <ValidatedNumberInput id="height" placeholder="e.g., 170" min={50} max={300} value={formData.height ?? null} onChange={(val) => updateField("height", val ?? (undefined as any))} />
                  </div>
                </div>
                {formData.weight && formData.height && formData.weight >= 10 && formData.height >= 50 && (
                  <p className="text-sm text-muted-foreground mt-2">BMI: {(formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)}</p>
                )}
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-4">{t("assessment.optionalDiabetes")}</p>
                <div>
                  <Label>{t("assessment.recentTest")}</Label>
                  <Select value={formData.recentDiabetesTest || ""} onValueChange={(v) => updateField("recentDiabetesTest", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.selectIfApplicable")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-test">{t("assessment.noRecentTest")}</SelectItem>
                      <SelectItem value="normal">{t("assessment.normalResults")}</SelectItem>
                      <SelectItem value="prediabetic">{t("assessment.prediabetic")}</SelectItem>
                      <SelectItem value="diabetic">{t("assessment.diabetic")}</SelectItem>
                      <SelectItem value="not-sure">{t("assessment.unsureResults")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(formData.recentDiabetesTest === "prediabetic" || formData.recentDiabetesTest === "diabetic" || formData.recentDiabetesTest === "normal") && (
                  <div className="mt-3">
                    <Label>{t("assessment.lastBloodSugar")}</Label>
                    <Select value={formData.lastBloodSugar || ""} onValueChange={(v) => updateField("lastBloodSugar", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.selectRange")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below-100">{t("assessment.below100")}</SelectItem>
                        <SelectItem value="100-125">{t("assessment.100to125")}</SelectItem>
                        <SelectItem value="126-plus">{t("assessment.126plus")}</SelectItem>
                        <SelectItem value="dont-know">{t("assessment.dontRemember")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Activity className="w-5 h-5" />
              <h3 className="font-medium">{t("assessment.lifestylePatterns")}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t("assessment.activityLevel")}</Label>
                <Select value={formData.activityLevel} onValueChange={(v) => updateField("activityLevel", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.howActive")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">{t("assessment.sedentaryDesc")}</SelectItem>
                    <SelectItem value="light">{t("assessment.lightDesc")}</SelectItem>
                    <SelectItem value="moderate">{t("assessment.moderateDesc")}</SelectItem>
                    <SelectItem value="active">{t("assessment.activeDesc")}</SelectItem>
                    <SelectItem value="very-active">{t("assessment.veryActiveDesc")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("assessment.avgSleep")}: {formData.sleepHours} {t("assessment.hours")}</Label>
                <Slider value={[formData.sleepHours]} onValueChange={([v]) => updateField("sleepHours", v)} min={3} max={12} step={0.5} className="mt-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>3 {t("assessment.hours")}</span>
                  <span>{t("assessment.ideal")}</span>
                  <span>12 {t("assessment.hours")}</span>
                </div>
              </div>

              <div>
                <Label>{t("assessment.stressLevel")}</Label>
                <Select value={formData.stressLevel} onValueChange={(v) => updateField("stressLevel", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.howStressed")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("assessment.stressLow")}</SelectItem>
                    <SelectItem value="moderate">{t("assessment.stressModerate")}</SelectItem>
                    <SelectItem value="high">{t("assessment.stressHigh")}</SelectItem>
                    <SelectItem value="very-high">{t("assessment.stressVeryHigh")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Heart className="w-5 h-5" />
              <h3 className="font-medium">{t("assessment.healthHistory")}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t("assessment.familyDiabetes")}</Label>
                <Select value={formData.familyHistoryDiabetes} onValueChange={(v) => updateField("familyHistoryDiabetes", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.anyDiabetes")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("assessment.noKnownHistory")}</SelectItem>
                    <SelectItem value="distant">{t("assessment.distantRelatives")}</SelectItem>
                    <SelectItem value="parent">{t("assessment.oneParent")}</SelectItem>
                    <SelectItem value="both">{t("assessment.bothParents")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("assessment.familyBP")}</Label>
                <Select value={formData.familyHistoryBP} onValueChange={(v) => updateField("familyHistoryBP", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.anyBP")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("assessment.noKnownHistory")}</SelectItem>
                    <SelectItem value="distant">{t("assessment.distantRel")}</SelectItem>
                    <SelectItem value="parent">{t("assessment.oneParent")}</SelectItem>
                    <SelectItem value="both">{t("assessment.bothParents")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("assessment.dietPattern")}</Label>
                <Select value={formData.dietType} onValueChange={(v) => updateField("dietType", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.usualEating")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">{t("assessment.balancedDesc")}</SelectItem>
                    <SelectItem value="vegetarian">{t("assessment.vegDesc")}</SelectItem>
                    <SelectItem value="high-carb">{t("assessment.highCarbDesc")}</SelectItem>
                    <SelectItem value="processed">{t("assessment.processedDesc")}</SelectItem>
                    <SelectItem value="mixed">{t("assessment.mixedDesc")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("assessment.smokingStatus")}</Label>
                <Select value={formData.smokingStatus} onValueChange={(v) => updateField("smokingStatus", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.yourSmoking")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">{t("assessment.neverSmoked")}</SelectItem>
                    <SelectItem value="former">{t("assessment.formerSmoker")}</SelectItem>
                    <SelectItem value="occasional">{t("assessment.occasionalSmoking")}</SelectItem>
                    <SelectItem value="regular">{t("assessment.regularSmoker")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("assessment.alcohol")}</Label>
                <Select value={formData.alcoholConsumption} onValueChange={(v) => updateField("alcoholConsumption", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.howOftenDrink")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">{t("assessment.never")}</SelectItem>
                    <SelectItem value="rarely">{t("assessment.rarely")}</SelectItem>
                    <SelectItem value="social">{t("assessment.socialDrinker")}</SelectItem>
                    <SelectItem value="moderate">{t("assessment.moderateDrink")}</SelectItem>
                    <SelectItem value="regular">{t("assessment.regularDrink")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("assessment.otherSubstances")}</Label>
                <Select value={formData.otherSubstances} onValueChange={(v) => updateField("otherSubstances", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("assessment.doYouUse")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("assessment.none")}</SelectItem>
                    <SelectItem value="gutka-occasional">{t("assessment.gutkaOcc")}</SelectItem>
                    <SelectItem value="gutka-regular">{t("assessment.gutkaReg")}</SelectItem>
                    <SelectItem value="other-occasional">{t("assessment.otherOcc")}</SelectItem>
                    <SelectItem value="other-regular">{t("assessment.otherReg")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>{t("common.back")}</Button>
          ) : (<div />)}
          <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
            {step === 3 ? t("assessment.viewRisk") : t("assessment.continue")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
