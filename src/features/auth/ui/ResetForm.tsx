'use client';

import Link from 'next/link';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { AuthPage } from './AuthPage';
import { PasswordInput } from './PasswordInput';
import { useResetForm } from '../model/useResetForm';

export function ResetForm() {
  const { t } = useTranslation();
  const {
    password,
    handlePasswordChange,
    confirmPassword,
    handleConfirmPasswordChange,
    handleSubmit,
    loading,
    passwordInvalid,
    confirmPasswordInvalid,
    passwordHelperText,
    confirmPasswordHelperText,
    linkError,
    generalError,
  } = useResetForm();

  return (
    <AuthPage
      title={t('auth.resetPassword')}
      subtitle={t('auth.resetPasswordSubtitle')}
      onSubmit={handleSubmit}
      type="forgot"
      submitButton={
        <div className="flex w-full flex-col items-center space-y-3">
          {linkError && <p className="text-primary text-center text-sm font-medium">{linkError}</p>}
          {generalError && (
            <p className="text-primary text-center text-sm font-medium">{generalError}</p>
          )}
          <Button type="submit" variant="primary" className="w-30 py-4" disabled={loading}>
            {loading ? t('auth.saving') : t('auth.confirm').toUpperCase()}
          </Button>
        </div>
      }
      footer={
        <Link href="/login">
          <Button variant="ghost" className="px-3">
            {t('auth.signIn').toUpperCase()}
          </Button>
        </Link>
      }
    >
      <PasswordInput
        value={password}
        onChange={handlePasswordChange}
        placeholder={t('common.password')}
        invalid={passwordInvalid}
        helperText={passwordHelperText}
      />

      <PasswordInput
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        placeholder={t('common.confirmPassword')}
        invalid={confirmPasswordInvalid}
        helperText={confirmPasswordHelperText}
      />
    </AuthPage>
  );
}
