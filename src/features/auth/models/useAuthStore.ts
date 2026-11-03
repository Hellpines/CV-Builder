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
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        verificationRequested: state.verificationRequested,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function syncAuthHydration(store: typeof useAuthStore = useAuthStore) {
  store.persist.onFinishHydration(() => {
    store.setState({ _hasHydrated: true });
  });

  if (store.persist.hasHydrated()) {
    store.setState({ _hasHydrated: true });
  }
}

if (typeof window !== 'undefined') {
  syncAuthHydration();
}
