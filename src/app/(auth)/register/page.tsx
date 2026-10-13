'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPage } from '@/features/auth/ui/AuthPage';
import { PasswordInput } from '@/features/auth/ui/PasswordInput';
import { SIGNUP_MUTATION } from '@/features/auth/api/AuthMutations';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { SignupResponse, SignupVariables } from '@/features/auth/types/AuthTypes';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [signup, { loading, error }] = useMutation<SignupResponse, SignupVariables>(
    SIGNUP_MUTATION,
    {
      onCompleted: (data) => {
        const { access_token, refresh_token, user } = data.signup;
        setAuth(access_token, refresh_token, user);
        router.push('/users');
      },
      onError: (err) => {
        console.error('Signup error:', err.message);
      },
    }
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signup({
      variables: {
        auth: { email, password, confirmPassword },
      },
    });
  };

  return (
    <AuthPage
      title="Sign up now"
      subtitle="Welcome! Sign up to continue"
      onSubmit={handleSubmit}
      submitButton={
        <Button type="submit" variant="primary" className="w-48 py-4" disabled={loading}>
          {loading ? 'LOADING...' : 'CREATE ACCOUNT'}
        </Button>
      }
      footer={
        <Link href="/login">
          <Button type="button" variant="ghost" className="px-8">
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
        className="text-primary-bold placeholder:text-muted h-12"
        required
      />

      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <PasswordInput
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
      />

      {error && <p className="text-center text-sm text-red-500">{error.message}</p>}
    </AuthPage>
  );
}
