'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPage } from './AuthPage';
import { PasswordInput } from './PasswordInput';
import { useRegisterForm } from '../model/useRegisterForm';

export function RegisterForm() {
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
      title="Sign up now"
      subtitle="Welcome! Sign up to continue"
      onSubmit={handleSubmit}
      submitButton={
        <div className="flex w-full flex-col items-center space-y-3">
          {generalError && (
            <p className="text-primary text-center text-sm font-medium">{generalError}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-55 py-4"
            disabled={loading || !isFormValid}
          >
            {loading ? 'LOADING...' : 'CREATE ACCOUNT'}
          </Button>
        </div>
      }
      footer={
        <Link href="/login">
          <Button
            type="button"
            variant="ghost"
            className="px-12 text-xs font-semibold tracking-wider"
          >
            I HAVE AN ACCOUNT
          </Button>
        </Link>
      }
    >
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        invalid={emailInvalid}
        helperText={emailHelperText}
        className="h-12"
      />

      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        invalid={passwordInvalid}
        helperText={passwordHelperText}
      />

      <PasswordInput
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm password"
        invalid={confirmPasswordInvalid}
        helperText={confirmPasswordHelperText}
      />
    </AuthPage>
  );
}
