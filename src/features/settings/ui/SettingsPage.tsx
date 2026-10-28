'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { SelectField } from '@/components/ui/select-field';
import { useTheme } from '@/shared/hooks/useTheme';
import type { Theme } from '@/shared/lib/theme';
import { useLanguage } from '@/shared/i18n/useLanguage';
import { THEME_OPTIONS } from '../model/themeOptions';
import { PasswordSection } from './PasswordSection';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-9">
      <div className="flex flex-col gap-9">
        <SelectField
          label={t('common.theme')}
          placeholder={t('common.selectTheme')}
          value={theme}
          options={THEME_OPTIONS.map((option) => ({ ...option, label: t(option.label) }))}
          onChange={(value) => setTheme(value as Theme)}
        />

        <SelectField
          label={t('common.language')}
          placeholder={t('common.selectLanguage')}
          value={language}
          options={[
            { value: 'en', label: t('languages.languageNames.en') },
            { value: 'fr', label: t('languages.languageNames.fr') },
            { value: 'de', label: t('languages.languageNames.de') },
            { value: 'it', label: t('languages.languageNames.it') },
            { value: 'pl', label: t('languages.languageNames.pl') },
            { value: 'pt', label: t('languages.languageNames.pt') },
            { value: 'ru', label: t('languages.languageNames.ru') },
            { value: 'es', label: t('languages.languageNames.es') },
            { value: 'uk', label: t('languages.languageNames.uk') },
          ]}
          onChange={(value) =>
            setLanguage(value as 'en' | 'fr' | 'de' | 'it' | 'pl' | 'pt' | 'ru' | 'es' | 'uk')
          }
        />
      </div>

      <PasswordSection />
    </div>
  );
}
