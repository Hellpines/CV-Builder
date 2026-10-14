'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPage } from '@/features/auth/ui/AuthPage';
import { PasswordInput } from '@/features/auth/ui/PasswordInput';
import { SIGNUP_MUTATION } from '@/features/auth/api/AuthMutations';
import { useAuthStore } from '@/features/auth/model/useAuthStore';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirmPassword, setTouchedConfirmPassword] = useState(false);

  const [signup, { loading, error }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      const { access_token, refresh_token, user } = data.signup;
      setAuth(access_token, refresh_token, user);
      router.push('/users');
    },
    onError: (err) => {
      console.error('Signup error:', err.message);
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTouchedEmail(true);
    setTouchedPassword(true);
    setTouchedConfirmPassword(true);

    if (!email || !password || !confirmPassword || password !== confirmPassword) {
      return;
    }

    signup({
      variables: {
        auth: { email, password, confirmPassword },
      },
    });
  };

  const emailInvalid = (submitted || touchedEmail) && !email;
  const passwordInvalid =
    (submitted || touchedPassword) &&
    (password.length === 0 || (password.length < 8 && password.length > 0));
  const confirmPasswordInvalid =
    (submitted || touchedConfirmPassword) && (!confirmPassword || password !== confirmPassword);

  const emailHelperText = emailInvalid
    ? 'Email is required'
    : error?.message === 'userAlreadyExists'
      ? 'Email is already registered'
      : undefined;

  const passwordHelperText = submitted
    ? password.length < 8 && password.length > 0
      ? 'Password too short'
      : password.length === 0
        ? 'Password is required'
        : undefined
    : undefined;

  const confirmPasswordHelperText = submitted
    ? password.length === 0
      ? 'Confirm password is required'
      : password !== confirmPassword
        ? 'Passwords do not match'
        : undefined
    : undefined;

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
        onChange={(e) => {
          setEmail(e.target.value);
          setTouchedEmail(true);
        }}
        invalid={emailInvalid || error?.message === 'userAlreadyExists'}
        helperText={emailHelperText}
        className="h-12"
      />

      <PasswordInput
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setTouchedPassword(true);
        }}
        placeholder="Password"
        invalid={passwordInvalid}
        helperText={passwordHelperText}
      />

      <PasswordInput
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setTouchedConfirmPassword(true);
        }}
        placeholder="Confirm password"
        invalid={confirmPasswordInvalid}
        helperText={confirmPasswordHelperText}
      />
    </AuthPage>
  );
}
