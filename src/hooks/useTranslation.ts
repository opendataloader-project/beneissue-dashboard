import type { TranslationKey } from "@/i18n/translations";
import { translations } from "@/i18n/translations";
import { languageAtom } from "@/store/atoms";
import { useAtom } from "jotai";

export function useTranslation() {
  const [language, setLanguage] = useAtom(languageAtom);

  const t = (key: TranslationKey): string => {
    return translations[language][key];
  };

  return { t, language, setLanguage };
}
