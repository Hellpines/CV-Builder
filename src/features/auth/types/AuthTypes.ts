import type { User } from '@/shared/types/user';
import type { ReactNode, SyntheticEvent } from 'react';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  _hasHydrated: boolean;
  verificationRequested: boolean;
  startVerification: () => void;
  clearVerification: () => void;
  setHasHydrated: (hydrated: boolean) => void;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

export type AuthPageProps = {
  title: string;
  subtitle: string;
  type?: 'sign' | 'forgot';
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  children: ReactNode;
  submitButton: ReactNode;
  footer?: ReactNode;
};

export interface LoginResponse {
  login: {
    access_token: string;
    refresh_token: string;
    user: User;
  };
}

export interface SignupResponse {
  signup: {
    access_token: string;
    refresh_token: string;
    user: User;
  };
}

export interface LoginVariables {
  auth: {
    email: string;
    password: string;
  };
}

export interface SignupVariables {
  auth: {
    email: string;
    password: string;
    confirmPassword: string;
  };
}
