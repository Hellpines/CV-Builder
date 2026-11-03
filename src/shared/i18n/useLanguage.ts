import { changeLanguage } from './languageStore';
import { useTranslation } from './useTranslation';

export function useLanguage() {
  const { language } = useTranslation();
  return { language, setLanguage: changeLanguage };
}
