import { otherUser } from '../fixtures/data';
import { seedAuth } from '../fixtures/auth';
import { expect, test } from '../fixtures/test';
import { expectToast, selectOption, selectTriggerByLabel } from '../fixtures/ui';

test.describe('Languages', () => {
  test.beforeEach(async ({ page, api }) => {
    void api;
    await seedAuth(page);
  });

  test('lists languages and adds a new one', async ({ page }) => {
    await page.goto('/languages');

    await expect(page.getByText('English')).toBeVisible();
    await expect(page.getByText('French')).toBeVisible();

    await page.getByRole('button', { name: 'Add language' }).click();
    await expect(page.getByRole('heading', { name: 'Add language' })).toBeVisible();

    await selectOption(page, selectTriggerByLabel(page, 'Language'), /^German/);
    await selectOption(page, selectTriggerByLabel(page, 'Language proficiency'), /B2/);
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    await expectToast(page, /German added successfully/i);
    await page.reload();
    await expect(page.getByText('German')).toBeVisible();
  });

  test('removes a language', async ({ page }) => {
    await page.goto('/languages');

    await page.getByRole('button', { name: 'Remove languages' }).click();
    await page.getByRole('button', { name: 'Select French' }).click();
    await page.getByRole('button', { name: /Delete/ }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expectToast(page, /removed successfully/i);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Update French' })).toHaveCount(0);
  });

  test('shows other user languages as read-only', async ({ page }) => {
    await page.goto(`/users/${otherUser.id}/languages`);

    await expect(page.getByText('English')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add language' })).toHaveCount(0);
  });
});
