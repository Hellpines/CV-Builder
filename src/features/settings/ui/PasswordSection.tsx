'use client';

import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/features/auth/ui/PasswordInput';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { usePasswordForm } from '../model/usePasswordForm';

export function PasswordSection() {
  const { t } = useTranslation();
  const form = usePasswordForm();

  return (
    <form noValidate onSubmit={form.handleSubmit} className="flex flex-col gap-6">
      <p className="text-m">{t('settings.password.title')}</p>

      <div className="flex flex-col gap-9">
        <PasswordInput
          placeholder={t('settings.password.current')}
          value={form.values.current}
          onChange={(event) => form.setField('current', event.target.value)}
          invalid={Boolean(form.errors.current)}
          helperText={form.errors.current}
        />
        <PasswordInput
          placeholder={t('settings.password.new')}
          value={form.values.next}
          onChange={(event) => form.setField('next', event.target.value)}
          invalid={Boolean(form.errors.next)}
          helperText={form.errors.next}
        />
        <PasswordInput
          placeholder={t('settings.password.confirm')}
          value={form.values.confirm}
          onChange={(event) => form.setField('confirm', event.target.value)}
          invalid={Boolean(form.errors.confirm)}
          helperText={form.errors.confirm}
        />

        <Button type="submit" variant="primary" className="ml-auto w-40" disabled={!form.canSubmit}>
          {t('settings.password.submit')}
        </Button>
      </div>
    </form>
  );
}
