import { currentUser } from '../fixtures/data';
import { seedAuth } from '../fixtures/auth';
import { expect, test } from '../fixtures/test';
import { openUserMenu } from '../fixtures/ui';

test.describe('Smoke / navigation', () => {
  test.beforeEach(async ({ page, api }) => {
    void api;
    await seedAuth(page);
  });

  test('navigates main sidebar sections', async ({ page }) => {
    await page.goto('/users');

    await page.getByRole('link', { name: 'Skills' }).click();
    await expect(page).toHaveURL(/\/skills$/);

    await page.getByRole('link', { name: 'Languages' }).click();
    await expect(page).toHaveURL(/\/languages$/);

    await page.getByRole('link', { name: 'CVs' }).click();
    await expect(page).toHaveURL(/\/cvs$/);

    await page.getByRole('link', { name: 'Employees' }).click();
    await expect(page).toHaveURL(/\/users$/);
  });

  test('opens own profile from user menu', async ({ page }) => {
    await page.goto('/users');
    await openUserMenu(page);
    await page.locator('[data-slot="dropdown-menu-item"]').filter({ hasText: 'Profile' }).click();
    await expect(page).toHaveURL(new RegExp(`/users/${currentUser.id}`));
  });

  test('toggles sidebar', async ({ page }) => {
    await page.goto('/users');
    const toggle = page.getByRole('button', { name: /Hide sidebar|Open sidebar/ });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole('button', { name: /Hide sidebar|Open sidebar/ })).toBeVisible();
  });

  test('blocks mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/users');

    await expect(page.getByText('Oops')).toBeVisible();
    await expect(page.getByText(/isn.t supported on mobile devices/i)).toBeVisible();
  });
});
