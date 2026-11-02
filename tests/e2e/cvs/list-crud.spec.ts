import { seedAuth } from '../fixtures/auth';
import { expect, test } from '../fixtures/test';
import { expectToast, fillField } from '../fixtures/ui';

test.describe('CVs / list CRUD', () => {
  test.beforeEach(async ({ page, api }) => {
    void api;
    await seedAuth(page);
  });

  test('lists existing CVs', async ({ page }) => {
    await page.goto('/cvs');
    await expect(page.getByRole('button', { name: 'Create CV' })).toBeVisible();
    await expect(page.getByText('Frontend CV')).toBeVisible();
  });

  test('creates a new CV', async ({ page }) => {
    await page.goto('/cvs');
    await page.getByRole('button', { name: 'Create CV' }).click();

    await expect(page.getByRole('heading', { name: 'Create CV' })).toBeVisible();
    await fillField(page, 'Name', 'Backend CV');
    await fillField(page, 'Education', 'MS Software Engineering');
    await fillField(page, 'Description', 'Backend-focused CV');
    await page.getByRole('button', { name: 'Create CV' }).last().click();

    await expectToast(page, /CV created successfully/i);
    await expect(page.getByText('Backend CV')).toBeVisible();
  });

  test('edits a CV from the list menu', async ({ page }) => {
    await page.goto('/cvs');
    await page.getByRole('button', { name: 'Actions for Frontend CV' }).click();
    await page.getByText('Edit', { exact: true }).click();

    await fillField(page, 'Name', 'Updated Frontend CV');
    await page.getByRole('button', { name: 'Save' }).click();

    await expectToast(page, /CV updated successfully/i);
    await expect(page.getByText('Updated Frontend CV')).toBeVisible();
  });

  test('views a CV from the list menu', async ({ page }) => {
    await page.goto('/cvs');
    await page.getByRole('button', { name: 'Actions for Frontend CV' }).click();
    await page.getByText('View', { exact: true }).click();
    await expect(page).toHaveURL(/\/cvs\/cv-1$/);
  });

  test('deletes a CV', async ({ page }) => {
    await page.goto('/cvs');
    await page.getByRole('button', { name: 'Actions for Frontend CV' }).click();
    await page.getByText('Delete', { exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Delete CV' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expectToast(page, /CV deleted successfully/i);
  });

  test('searches CVs by name', async ({ page }) => {
    await page.goto('/cvs');
    await page.getByRole('textbox', { name: 'Search' }).fill('Unknown');
    await expect(page.getByText('No CVs found')).toBeVisible();
  });
});
