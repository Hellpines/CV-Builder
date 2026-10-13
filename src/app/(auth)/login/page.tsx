'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPage } from '@/features/auth/ui/AuthPage';
import { PasswordInput } from '@/features/auth/ui/PasswordInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <AuthPage
      title="Welcome back"
      subtitle="Hello again! Sign in to continue"
      onSubmit={handleSubmit}
      submitButton={
        <Button type="submit" variant="primary" className="w-40 py-4">
          SIGN IN
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
    </AuthPage>
  );
}
