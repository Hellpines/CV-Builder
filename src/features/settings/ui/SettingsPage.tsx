'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select-field';
import { PasswordInput } from '@/features/auth/ui/PasswordInput';
import { useTheme } from '@/shared/hooks/useTheme';
import type { Theme } from '@/shared/lib/theme';
import { useLanguage } from '@/shared/i18n/useLanguage';
import { THEME_OPTIONS } from '../model/themeOptions';

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

      <div className="flex flex-col gap-6">
        <p className="text-m">{t('settings.changePassword')}</p>
        <div className="flex flex-col gap-9">
          <PasswordInput placeholder={t('common.password')} value="" onChange={() => {}} />
          <PasswordInput placeholder={t('common.newPassword')} value="" onChange={() => {}} />
          <PasswordInput placeholder={t('common.confirmPassword')} value="" onChange={() => {}} />
          <Button
            variant="primary"
            className="ml-auto w-40"
            onClick={() => console.log('Change password clicked')}
          >
            {t('settings.change')}
          </Button>
        </div>
      </div>
    </div>
  );
}
