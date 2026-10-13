'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPage } from '@/features/auth/ui/AuthPage';
import { PasswordInput } from '@/features/auth/ui/PasswordInput';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ email, password, confirmPassword });
  };

  return (
    <AuthPage
      title="Sign up now"
      subtitle="Welcome! Sign up to continue"
      onSubmit={handleSubmit}
      submitButton={
        <Button type="submit" variant="primary" className="w-48 py-4">
          CREATE ACCOUNT
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
    </AuthPage>
  );
}
