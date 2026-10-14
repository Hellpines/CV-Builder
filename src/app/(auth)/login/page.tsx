'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPage } from '@/features/auth/ui/AuthPage';
import { PasswordInput } from '@/features/auth/ui/PasswordInput';
import { LOGIN_MUTATION } from '@/features/auth/api/AuthMutations';
import { useAuthStore } from '@/features/auth/model/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [login, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { access_token, refresh_token, user } = data.login;
      setAuth(access_token, refresh_token, user);
      router.push('/users');
    },
    onError: (err) => {
      console.error('Login error:', err.message);
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({
      variables: {
        auth: { email, password },
      },
    });
  };

  return (
    <AuthPage
      title="Welcome back"
      subtitle="Hello again! Sign in to continue"
      onSubmit={handleSubmit}
      submitButton={
        <Button type="submit" variant="primary" className="w-40 py-4" disabled={loading}>
          {loading ? 'LOADING...' : 'SIGN IN'}
        </Button>
      }
      footer={
        <Link href="#">
          <Button variant="ghost" className="px-4">
            Forgot password
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

      {error && <p className="text-primary text-center text-sm">{error.message}</p>}
    </AuthPage>
  );
}
