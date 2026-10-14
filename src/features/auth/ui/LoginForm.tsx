'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPage } from './AuthPage';
import { PasswordInput } from './PasswordInput';
import { useLoginForm } from '../model/useLoginForm';

export function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
    loading,
    emailInvalid,
    passwordInvalid,
    emailHelperText,
    passwordHelperText,
    generalError,
    isFormValid,
  } = useLoginForm();

  return (
    <AuthPage
      title="Welcome back"
      subtitle="Hello again! Sign in to continue"
      onSubmit={handleSubmit}
      submitButton={
        <div className="flex w-full flex-col items-center space-y-3">
          {generalError && (
            <p className="text-primary text-center text-sm font-medium">{generalError}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-40 py-4"
            disabled={loading || !isFormValid}
          >
            {loading ? 'LOADING...' : 'SIGN IN'}
          </Button>
        </div>
      }
      footer={
        <Link href="/forgot-password">
          <Button variant="ghost" className="px-4 text-xs font-semibold tracking-wider">
            FORGOT PASSWORD
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
    </AuthPage>
  );
}
