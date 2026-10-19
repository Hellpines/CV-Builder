import { AuthState } from '@/features/auth/types/AuthTypes';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      verificationRequested: false,
      _hasHydrated: false,

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      setAuth: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),

      startVerification: () => set({ verificationRequested: true }),
      clearVerification: () => set({ verificationRequested: false }),

      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null, verificationRequested: false }),

      updateUser: (patch) =>
        set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
