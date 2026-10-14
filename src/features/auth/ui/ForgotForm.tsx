'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPage } from './AuthPage';
import { useForgotForm } from '../model/useForgotForm';

export function ForgotForm() {
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
      title="Forgot password"
      subtitle="We will send you an email with further instructions"
      onSubmit={handleSubmit}
      type="forgot"
      submitButton={
        !isSuccess ? (
          <div className="flex w-full flex-col items-center space-y-3">
            {formError && (
              <p className="text-primary text-center text-sm font-medium">{formError}</p>
            )}
            <Button type="submit" variant="primary" className="w-55 py-4" disabled={loading}>
              {loading ? 'SENDING...' : 'RESET PASSWORD'}
            </Button>
          </div>
        ) : null
      }
      footer={
        <Link href="/login">
          <Button variant="ghost" className="w-55 py-4">
            CANCEL
          </Button>
        </Link>
      }
    >
      {isSuccess ? (
        <div className="text-m py-4 text-center uppercase">
          Password recovery instructions have been sent to your email address.
        </div>
      ) : (
        <Input
          type="email"
          placeholder="Email"
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
