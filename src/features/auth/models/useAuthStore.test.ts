import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { User } from '@/shared/types/user';
import { useAuthStore } from './useAuthStore';

const user = {
  id: 'u1',
  created_at: '2024-01-01',
  email: 'user@example.com',
  is_verified: false,
  profile: {} as User['profile'],
  role: 'Employee',
  department: null,
  position: null,
  cvs: null,
} satisfies User;

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      verificationRequested: false,
      _hasHydrated: false,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('marks hydrated when persist finishes hydration', async () => {
    useAuthStore.setState({ _hasHydrated: false });
    await useAuthStore.persist.rehydrate();
    expect(useAuthStore.getState()._hasHydrated).toBe(true);
  });

  it('starts with empty auth state', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.verificationRequested).toBe(false);
  });

  it('setAuth stores tokens and user', () => {
    useAuthStore.getState().setAuth('access', 'refresh', user);

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'access',
      refreshToken: 'refresh',
      user,
    });
  });

  it('logout clears auth and verification flag', () => {
    useAuthStore.getState().setAuth('access', 'refresh', user);
    useAuthStore.getState().startVerification();

    useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      refreshToken: null,
      user: null,
      verificationRequested: false,
    });
  });

  it('startVerification and clearVerification toggle the flag', () => {
    useAuthStore.getState().startVerification();
    expect(useAuthStore.getState().verificationRequested).toBe(true);

    useAuthStore.getState().clearVerification();
    expect(useAuthStore.getState().verificationRequested).toBe(false);
  });

  it('setHasHydrated updates hydration flag', () => {
    useAuthStore.getState().setHasHydrated(true);
    expect(useAuthStore.getState()._hasHydrated).toBe(true);
  });

  it('updateUser merges patch when user exists', () => {
    useAuthStore.getState().setAuth('access', 'refresh', user);
    useAuthStore.getState().updateUser({ is_verified: true, email: 'new@example.com' });

    expect(useAuthStore.getState().user).toMatchObject({
      id: 'u1',
      is_verified: true,
      email: 'new@example.com',
    });
  });

  it('updateUser is a no-op when user is null', () => {
    useAuthStore.getState().updateUser({ is_verified: true });
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('persists partialized auth fields to localStorage', () => {
    useAuthStore.getState().setAuth('access', 'refresh', user);
    useAuthStore.getState().startVerification();

    const raw = localStorage.getItem('auth-storage');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.state).toMatchObject({
      accessToken: 'access',
      refreshToken: 'refresh',
      user,
      verificationRequested: true,
    });
    expect(parsed.state).not.toHaveProperty('_hasHydrated');
    expect(parsed.state).not.toHaveProperty('setAuth');
  });
});
