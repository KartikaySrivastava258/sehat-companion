import { en } from "./en";
import { hi } from "./hi";
import { ta } from "./ta";
import { te } from "./te";
import { bn } from "./bn";
import { mr } from "./mr";
import type { Language } from "@/contexts/LanguageContext";

export const translations: Record<Language, Record<string, string>> = {
  en, hi, ta, te, bn, mr,
};
