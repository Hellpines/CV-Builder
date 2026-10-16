import type { User, UserRole } from '@/features/users/types/UserTypes';
import type { ReactNode, SyntheticEvent } from 'react';
import type { Department, Position, Profile, Cv } from '@/features/users/types/UserTypes';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

export type AuthUser = {
  id: string;
  created_at: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  profile: Profile;
  department: Department | null;
  position: Position | null;
  cvs: Cv[] | null;
};

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
    user: AuthUser;
  };
}

export interface SignupResponse {
  signup: {
    access_token: string;
    refresh_token: string;
    user: AuthUser;
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
