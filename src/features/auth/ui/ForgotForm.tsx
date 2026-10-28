'use client';

import Link from 'next/link';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPage } from './AuthPage';
import { useForgotForm } from '../model/useForgotForm';

export function ForgotForm() {
  const { t } = useTranslation();
  const {
    email,
    setEmail,
    handleSubmit,
    loading,
    emailInvalid,
    emailHelperText,
    isSuccess,
    formError,
  } = useForgotForm();

  return (
    <AuthPage
      title={t('auth.forgotPassword')}
      subtitle={t('auth.resetPasswordSubtitle')}
      onSubmit={handleSubmit}
      type="forgot"
      submitButton={
        !isSuccess ? (
          <div className="flex w-full flex-col items-center space-y-3">
            {formError && (
              <p className="text-primary text-center text-sm font-medium">{formError}</p>
            )}
            <Button type="submit" variant="primary" className="w-55 py-4" disabled={loading}>
              {loading ? t('auth.sending') : t('auth.resetPassword').toUpperCase()}
            </Button>
          </div>
        ) : null
      }
      footer={
        <Link href="/login">
          <Button variant="ghost" className="w-55 py-4">
            {t('common.cancel').toUpperCase()}
          </Button>
        </Link>
      }
    >
      {isSuccess ? (
        <div className="text-m py-4 text-center uppercase">{t('auth.passwordRecoverySent')}</div>
      ) : (
        <Input
          type="email"
          placeholder={t('common.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          invalid={emailInvalid}
          helperText={emailHelperText}
          className="h-12"
        />
      )}
    </AuthPage>
  );
}
