'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="pt-6">
        <div className="mx-auto flex w-full max-w-140 justify-center text-sm font-medium">
          <Link
            href="/login"
            className={`flex w-37.5 justify-center pb-4 transition-colors ${
              pathname === '/login'
                ? 'border-primary text-primary border-b-2 font-semibold'
                : 'text-primary-text hover:text-primary'
            }`}
          >
            SIGN IN
          </Link>
          <Link
            href="/register"
            className={`flex w-37.5 justify-center pb-4 transition-colors ${
              pathname === '/register'
                ? 'border-primary text-primary border-b-2 font-semibold'
                : 'text-primary-text hover:text-primary'
            }`}
          >
            SIGN UP
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        <div className="w-full max-w-140">
          <div className="mb-10.5 text-center">
            <h1 className="text-primary-bold mb-6 text-4xl font-normal">Welcome back</h1>
            <p className="text-md text-primary-bold">Hello again! Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-9">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-primary-bold placeholder:text-muted h-12"
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-primary-bold placeholder:text-muted h-12 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-primary-text hover:text-primary-bold absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex justify-center pt-4">
              <Button type="submit" variant="primary" className="w-40 py-4">
                SIGN IN
              </Button>
            </div>
          </form>

          <div className="mt-2 text-center">
            <Link href="#">
              <Button variant="ghost" className="px-4">
                Forgot password
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
