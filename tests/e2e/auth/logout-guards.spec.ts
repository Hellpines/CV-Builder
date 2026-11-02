import { disableAuthSeed, seedAuth } from '../fixtures/auth';
import { expect, test } from '../fixtures/test';
import { openUserMenu } from '../fixtures/ui';

test.describe('Auth / logout & route guards', () => {
  test('redirects unauthenticated users from dashboard to login', async ({ page, api }) => {
    void api;
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('redirects root based on auth state', async ({ page, api }) => {
    void api;
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);

    await seedAuth(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/users$/);
  });

  test('logs out from user menu and clears session', async ({ page, api }) => {
    void api;
    await seedAuth(page);
    await page.goto('/users');
    await expect(page.getByRole('textbox', { name: 'Search' })).toBeVisible();

    await openUserMenu(page);
    await page.locator('[data-slot="dropdown-menu-item"]').filter({ hasText: 'Logout' }).click();

    await expect(page).toHaveURL(/\/login$/);

    await disableAuthSeed(page);
    await page.goto('/cvs');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('shows 404 page for unknown routes', async ({ page, api }) => {
    void api;
    await seedAuth(page);
    await page.goto('/this-page-does-not-exist');

    await expect(page.getByText('Hmm...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
  });
});
