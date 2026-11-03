import type { Page } from '@playwright/test';
import { currentUser, type MockUser } from './data';

const DISABLE_SEED_KEY = 'e2e-disable-auth-seed';

export function buildAuthStorage(
  overrides: {
    accessToken?: string | null;
    refreshToken?: string | null;
    user?: MockUser | null;
    verificationRequested?: boolean;
  } = {}
) {
  return {
    state: {
      accessToken: overrides.accessToken === undefined ? 'access-token' : overrides.accessToken,
      refreshToken: overrides.refreshToken === undefined ? 'refresh-token' : overrides.refreshToken,
      user: overrides.user === undefined ? structuredClone(currentUser) : overrides.user,
      verificationRequested: overrides.verificationRequested ?? false,
    },
    version: 0,
  };
}

export async function seedAuth(page: Page, overrides: Parameters<typeof buildAuthStorage>[0] = {}) {
  const storage = buildAuthStorage(overrides);
  await page.addInitScript(
    ({ value, disableKey }) => {
      if (sessionStorage.getItem(disableKey) === '1') return;
      localStorage.setItem('auth-storage', JSON.stringify(value));
    },
    { value: storage, disableKey: DISABLE_SEED_KEY }
  );
}

export async function disableAuthSeed(page: Page) {
  await page.evaluate((disableKey) => {
    sessionStorage.setItem(disableKey, '1');
    localStorage.removeItem('auth-storage');
  }, DISABLE_SEED_KEY);
}

export async function loginViaUi(page: Page, email = currentUser.email, password = 'password1') {
  const { fillField } = await import('./ui');
  await page.goto('/login');
  await fillField(page, 'Email', email);
  await fillField(page, /^Password$/, password);
  await page.getByRole('button', { name: 'SIGN IN' }).click();
  await page.waitForURL('**/users');
}
