import { seedAuth } from '../fixtures/auth';
import { expect, test } from '../fixtures/test';
import {
  expectToast,
  fillField,
  selectOption,
  selectTriggerByLabel,
  tabLink,
} from '../fixtures/ui';

test.describe('CVs / details, skills, projects, preview', () => {
  test.beforeEach(async ({ page, api }) => {
    void api;
    await seedAuth(page);
  });

  test('updates CV details', async ({ page }) => {
    await page.goto('/cvs/cv-1');

    await expect(tabLink(page, '/cvs/cv-1')).toBeVisible();
    await fillField(page, 'Name', 'Senior Frontend CV');
    await fillField(page, 'Education', 'BS Computer Science');
    await fillField(page, 'Description', 'Updated description');
    await page.getByRole('button', { name: 'Update' }).click();

    await expectToast(page, /CV updated successfully/i);
  });

  test('manages CV skills', async ({ page }) => {
    await page.goto('/cvs/cv-1/skills');

    await expect(page.getByText('TypeScript')).toBeVisible();
    await page.getByRole('button', { name: 'Add skill' }).click();
    await expect(page.getByRole('heading', { name: 'Add skill' })).toBeVisible();

    await selectOption(page, selectTriggerByLabel(page, 'Skill'), 'GraphQL');
    await selectOption(page, selectTriggerByLabel(page, 'Skill mastery'), 'Advanced');
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    await expectToast(page, /GraphQL added successfully/i);
    await page.reload();
    await expect(page.getByText('GraphQL')).toBeVisible();
  });

  test('adds a CV project', async ({ page }) => {
    await page.goto('/cvs/cv-1/projects');

    await expect(page.getByRole('cell', { name: 'CV Builder', exact: true })).toBeVisible();
    await page.getByLabel('Add project').click();
    await expect(page.getByRole('heading', { name: 'Add project' })).toBeVisible();

    await selectOption(page, selectTriggerByLabel(page, 'Name'), 'Analytics Hub');
    await selectOption(page, selectTriggerByLabel(page, 'Roles'), 'Frontend Developer');
    await fillField(page, 'Responsibilities', 'Built dashboards');
    await page.getByRole('button', { name: 'Add project' }).last().click();

    await expectToast(page, /Project added successfully/i);
    await page.reload();
    await expect(page.getByRole('cell', { name: 'Analytics Hub', exact: true })).toBeVisible();
  });

  test('removes a CV project', async ({ page }) => {
    await page.goto('/cvs/cv-1/projects');

    await expect(page.getByRole('cell', { name: 'CV Builder', exact: true })).toBeVisible();
    await page.getByLabel('Actions CV Builder').click();
    await page.locator('[data-slot="dropdown-menu-item"]').filter({ hasText: 'Delete' }).click();
    await expect(page.getByRole('heading', { name: 'Remove project' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expectToast(page, /Project removed successfully/i);
  });

  test('shows CV preview and exports PDF', async ({ page }) => {
    await page.goto('/cvs/cv-1/preview');

    await expect(page.getByText('Frontend CV').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export PDF' })).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 10_000 }).catch(() => null);
    await page.getByRole('button', { name: 'Export PDF' }).click();
    await expectToast(page, /PDF exported successfully/i);
    await downloadPromise;
  });

  test('navigates CV tabs', async ({ page }) => {
    await page.goto('/cvs/cv-1');
    await expect(fieldName(page)).toBeVisible();

    await tabLink(page, '/cvs/cv-1/skills').click();
    await expect(page).toHaveURL(/\/cvs\/cv-1\/skills$/);
    await expect(page.getByRole('button', { name: 'Add skill' })).toBeVisible();

    await tabLink(page, '/cvs/cv-1/projects').click();
    await expect(page).toHaveURL(/\/cvs\/cv-1\/projects$/);
    await expect(page.getByLabel('Add project')).toBeVisible();

    await tabLink(page, '/cvs/cv-1/preview').click();
    await expect(page).toHaveURL(/\/cvs\/cv-1\/preview$/);
    await expect(page.getByRole('button', { name: 'Export PDF' })).toBeVisible();

    await tabLink(page, '/cvs/cv-1').click();
    await expect(page).toHaveURL(/\/cvs\/cv-1$/);
    await expect(fieldName(page)).toBeVisible();
  });

  test('shows 404 for non-owner CV', async ({ page, api }) => {
    api.cvs[0].user = { id: 'user-2', email: 'grace@example.com' };
    await page.goto('/cvs/cv-1');
    await expect(page.getByText('Hmm...')).toBeVisible();
  });
});

function fieldName(page: import('@playwright/test').Page) {
  return page
    .locator('div.relative')
    .filter({ has: page.locator('label', { hasText: 'Name' }) })
    .locator('input')
    .first();
}
