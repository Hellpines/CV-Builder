import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from './config';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import uk from './locales/uk.json';

export const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    it: { translation: it },
    pl: { translation: pl },
    pt: { translation: pt },
    ru: { translation: ru },
    es: { translation: es },
    uk: { translation: uk },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  initAsync: false,
  react: { useSuspense: false },
});
