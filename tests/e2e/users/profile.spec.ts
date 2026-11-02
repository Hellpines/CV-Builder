import { currentUser, otherUser } from '../fixtures/data';
import { seedAuth } from '../fixtures/auth';
import { expect, test } from '../fixtures/test';
import {
  expectToast,
  fieldByLabel,
  fillField,
  selectOption,
  selectTriggerByText,
  tabLink,
} from '../fixtures/ui';

test.describe('Users / profile', () => {
  test.beforeEach(async ({ page, api }) => {
    void api;
    await seedAuth(page);
  });

  test('edits own profile fields', async ({ page }) => {
    await page.goto(`/users/${currentUser.id}`);

    await expect(page.getByRole('heading', { name: 'Ada Lovelace' })).toBeVisible();
    await fillField(page, 'First Name', 'Augusta');
    await fillField(page, 'Last Name', 'Byron');

    await selectOption(page, selectTriggerByText(page, 'Engineering'), 'Design');
    await selectOption(page, selectTriggerByText(page, 'Frontend Developer'), 'UX Designer');

    await page.getByRole('button', { name: 'Update' }).click();
    await expectToast(page, /Profile updated successfully/i);
  });

  test('shows other user profile as read-only', async ({ page }) => {
    await page.goto(`/users/${otherUser.id}`);

    await expect(page.getByRole('heading', { name: 'Grace Hopper' })).toBeVisible();
    await expect(fieldByLabel(page, 'First Name')).toBeDisabled();
    await expect(fieldByLabel(page, 'Last Name')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Update' })).toHaveCount(0);
  });

  test('navigates between profile tabs', async ({ page }) => {
    await page.goto(`/users/${currentUser.id}`);

    await tabLink(page, `/users/${currentUser.id}/skills`).click();
    await expect(page).toHaveURL(new RegExp(`/users/${currentUser.id}/skills`));

    await tabLink(page, `/users/${currentUser.id}/languages`).click();
    await expect(page).toHaveURL(new RegExp(`/users/${currentUser.id}/languages`));

    await tabLink(page, `/users/${currentUser.id}`).click();
    await expect(page).toHaveURL(new RegExp(`/users/${currentUser.id}$`));
  });
});
