import { currentUser, otherUser } from '../fixtures/data';
import { seedAuth } from '../fixtures/auth';
import { expect, test } from '../fixtures/test';
import { expectToast, selectOption, selectTriggerByLabel } from '../fixtures/ui';

test.describe('Skills', () => {
  test.beforeEach(async ({ page, api }) => {
    void api;
    await seedAuth(page);
  });

  test('lists current user skills and adds a new one', async ({ page }) => {
    await page.goto('/skills');

    await expect(page.getByText('TypeScript')).toBeVisible();
    await expect(page.getByText('React')).toBeVisible();

    await page.getByRole('button', { name: 'Add skill' }).click();
    await expect(page.getByRole('heading', { name: 'Add skill' })).toBeVisible();

    await selectOption(page, selectTriggerByLabel(page, 'Skill'), 'GraphQL');
    await selectOption(page, selectTriggerByLabel(page, 'Skill mastery'), 'Competent');
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    await expectToast(page, /GraphQL added successfully/i);
    await page.reload();
    await expect(page.getByText('GraphQL')).toBeVisible();
  });

  test('removes a skill after selection', async ({ page }) => {
    await page.goto('/skills');

    await page.getByRole('button', { name: 'Remove skills' }).click();
    await page.getByRole('button', { name: 'Select TypeScript' }).click();
    await page.getByRole('button', { name: /Delete/ }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expectToast(page, /removed successfully/i);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Update TypeScript' })).toHaveCount(0);
  });

  test('shows other user skills as read-only', async ({ page }) => {
    await page.goto(`/users/${otherUser.id}/skills`);

    await expect(page.getByText('Figma')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add skill' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Remove skills' })).toHaveCount(0);
  });

  test('opens skills from own profile route', async ({ page }) => {
    await page.goto(`/users/${currentUser.id}/skills`);
    await expect(page.getByRole('button', { name: 'Add skill' })).toBeVisible();
    await expect(page.getByText('TypeScript')).toBeVisible();
  });
});
