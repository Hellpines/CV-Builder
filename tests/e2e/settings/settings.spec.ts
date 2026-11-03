import { seedAuth } from '../fixtures/auth';
import { expect, test } from '../fixtures/test';
import {
  expectToast,
  fillField,
  openUserMenu,
  selectOption,
  selectTriggerByText,
} from '../fixtures/ui';
test.describe('Settings', () => {
  test.beforeEach(async ({ page, api }) => {
    void api;
    await seedAuth(page);
  });

  test('opens settings from user menu', async ({ page }) => {
    await page.goto('/users');
    await openUserMenu(page);
    await page.locator('[data-slot="dropdown-menu-item"]').filter({ hasText: 'Settings' }).click();
    await expect(page).toHaveURL(/\/settings$/);
  });

  test('changes theme', async ({ page }) => {
    await page.goto('/settings');

    await selectOption(page, selectTriggerByText(page, 'Device settings'), 'Dark');
    await expect(page.locator('html')).toHaveClass(/dark/);

    await selectOption(page, selectTriggerByText(page, 'Dark'), 'Light');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('changes language', async ({ page }) => {
    await page.goto('/settings');
    await selectOption(page, selectTriggerByText(page, 'English'), 'Russian');

    await expect.poll(async () => page.evaluate(() => localStorage.getItem('language'))).toBe('ru');
  });

  test('updates password successfully', async ({ page }) => {
    await page.goto('/settings');

    await fillField(page, 'Current password', 'password1');
    await fillField(page, 'New password', 'password2');
    await fillField(page, 'Confirm new password', 'password2');
    await page.getByRole('button', { name: 'Update password' }).click();

    await expectToast(page, /Password changed successfully/i);
  });

  test('shows error for incorrect current password', async ({ page }) => {
    await page.goto('/settings');

    await fillField(page, 'Current password', 'wrong-password');
    await fillField(page, 'New password', 'password2');
    await fillField(page, 'Confirm new password', 'password2');
    await page.getByRole('button', { name: 'Update password' }).click();

    await expect(page.getByText(/incorrect|Failed to change password/i).first()).toBeVisible();
  });
});
