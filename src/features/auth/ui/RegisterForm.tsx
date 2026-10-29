'use client';

import Link from 'next/link';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPage } from './AuthPage';
import { PasswordInput } from './PasswordInput';
import { useRegisterForm } from '../model/useRegisterForm';

export function RegisterForm() {
  const { t } = useTranslation();
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleSubmit,
    loading,
    emailInvalid,
    passwordInvalid,
    confirmPasswordInvalid,
    emailHelperText,
    passwordHelperText,
    confirmPasswordHelperText,
    generalError,
    isFormValid,
  } = useRegisterForm();

  return (
    <AuthPage
      title={t('auth.signUp')}
      subtitle={t('auth.welcomeSubtitle')}
      onSubmit={handleSubmit}
      submitButton={
        <div className="flex w-full flex-col items-center space-y-3">
          {generalError && (
            <p className="text-primary text-center text-sm font-medium">{generalError}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-80 min-w-80 py-4 whitespace-nowrap"
            disabled={loading || !isFormValid}
          >
            {loading ? t('auth.loading') : t('auth.createAccount').toUpperCase()}
          </Button>
        </div>
      }
      footer={
        <Link href="/login">
          <Button variant="ghost" className="w-80 min-w-80 py-4 whitespace-nowrap">
            {t('auth.haveAccount').toUpperCase()}
          </Button>
        </Link>
      }
    >
      <Input
        type="email"
        placeholder={t('common.email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        invalid={emailInvalid}
        helperText={emailHelperText}
        className="h-12"
      />

      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('common.password')}
        invalid={passwordInvalid}
        helperText={passwordHelperText}
      />

      <PasswordInput
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t('common.confirmPassword')}
        invalid={confirmPasswordInvalid}
        helperText={confirmPasswordHelperText}
      />
    </AuthPage>
  );
}
