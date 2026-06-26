import { forwardRef } from "react";
import { Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Disclaimer = forwardRef<HTMLDivElement>(function Disclaimer(_, ref) {
  const { t } = useLanguage();
  return (
    <div ref={ref} className="bg-secondary/50 border border-border rounded-xl p-4 flex gap-3 items-start">
      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground leading-relaxed">
        <span className="font-medium text-foreground">{t("disclaimer.important")}:</span> {t("disclaimer.fullText")}
      </p>
    </div>
  );
});
