'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthPage } from './AuthPage';
import { PasswordInput } from './PasswordInput';
import { useResetForm } from '../model/useResetForm';

export function ResetForm() {
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
      title="Reset password"
      subtitle="Here you should write a new password and confirm it"
      onSubmit={handleSubmit}
      type="forgot"
      submitButton={
        <div className="flex w-full flex-col items-center space-y-3">
          {linkError && <p className="text-primary text-center text-sm font-medium">{linkError}</p>}
          {generalError && (
            <p className="text-primary text-center text-sm font-medium">{generalError}</p>
          )}
          <Button type="submit" variant="primary" className="w-30 py-4" disabled={loading}>
            {loading ? 'SAVING...' : 'SUBMIT'}
          </Button>
        </div>
      }
      footer={
        <Link href="/login">
          <Button variant="ghost" className="px-3">
            GO TO SIGN IN
          </Button>
        </Link>
      }
    >
      <PasswordInput
        value={password}
        onChange={handlePasswordChange}
        placeholder="Password"
        invalid={passwordInvalid}
        helperText={passwordHelperText}
      />

      <PasswordInput
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        placeholder="Confirm password"
        invalid={confirmPasswordInvalid}
        helperText={confirmPasswordHelperText}
      />
    </AuthPage>
  );
}
