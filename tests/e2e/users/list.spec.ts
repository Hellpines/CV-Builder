import { currentUser, otherUser } from '../fixtures/data';
import { seedAuth } from '../fixtures/auth';
import { expect, test } from '../fixtures/test';

test.describe('Users / employees list', () => {
  test.beforeEach(async ({ page, api }) => {
    void api;
    await seedAuth(page);
  });

  test('lists employees with profile data', async ({ page }) => {
    await page.goto('/users');

    const table = page.locator('table');
    await expect(page.getByRole('textbox', { name: 'Search' })).toBeVisible();
    await expect(
      table.getByRole('cell', { name: currentUser.profile.first_name!, exact: true })
    ).toBeVisible();
    await expect(
      table.getByRole('cell', { name: otherUser.profile.first_name!, exact: true })
    ).toBeVisible();
    await expect(table.getByRole('cell', { name: currentUser.email, exact: true })).toBeVisible();
    await expect(table.getByRole('cell', { name: 'Engineering', exact: true })).toBeVisible();
  });

  test('filters employees by search', async ({ page }) => {
    await page.goto('/users');
    await page.getByRole('textbox', { name: 'Search' }).fill('Grace');

    const table = page.locator('table');
    await expect(table.getByRole('cell', { name: 'Grace', exact: true })).toBeVisible();
    await expect(table.getByRole('cell', { name: 'Ada', exact: true })).toHaveCount(0);
  });

  test('opens employee profile from the list', async ({ page }) => {
    await page.goto('/users');
    await page.getByRole('button', { name: 'View employee details' }).first().click();
    await expect(page).toHaveURL(/\/users\/user-/);
  });
});
