import { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  role: string;
  is_verified: boolean;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

export type AuthPageProps = {
  title: string;
  subtitle: string;
  type?: 'sign' | 'forgot';
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  children: ReactNode;
  submitButton: ReactNode;
  footer?: ReactNode;
};

export interface LoginResponse {
  login: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email: string;
      role: string;
      is_verified: boolean;
    };
  };
}

export interface LoginVariables {
  auth: {
    email: string;
    password: string;
  };
}

export interface SignupResponse {
  signup: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email: string;
      role: string;
      is_verified: boolean;
    };
  };
}

export interface SignupVariables {
  auth: {
    email: string;
    password: string;
    confirmPassword: string;
  };
}
