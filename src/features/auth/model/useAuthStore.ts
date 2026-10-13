import { create } from 'zustand';
import { AuthState } from '../types/AuthTypes';

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setAuth: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
  logout: () => set({ accessToken: null, refreshToken: null, user: null }),
}));
