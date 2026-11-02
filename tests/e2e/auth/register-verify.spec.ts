import { currentUser } from '../fixtures/data';
import { seedAuth } from '../fixtures/auth';
import { expect, test } from '../fixtures/test';
import { fillField, fillOtp } from '../fixtures/ui';

test.describe('Auth / register & verify', () => {
  test('registers a new account and opens verify email', async ({ page, api }) => {
    void api;
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
    await fillField(page, 'Email', 'newbie@example.com');
    await fillField(page, /^Password$/, 'password1');
    await fillField(page, 'Confirm password', 'password1');
    await page.getByRole('button', { name: 'CREATE ACCOUNT' }).click();

    await expect(page).toHaveURL(/\/verify-email$/);
    await expect(page.getByRole('heading', { name: 'Email verification' })).toBeVisible();
  });

  test('shows error when account already exists', async ({ page, api }) => {
    void api;
    await page.goto('/register');
    await fillField(page, 'Email', 'exists@example.com');
    await fillField(page, /^Password$/, 'password1');
    await fillField(page, 'Confirm password', 'password1');
    await page.getByRole('button', { name: 'CREATE ACCOUNT' }).click();

    await expect(page.getByText(/already exists/i).first()).toBeVisible();
  });

  test('verifies email with OTP and redirects to users', async ({ page, api }) => {
    void api;
    await seedAuth(page, {
      user: { ...structuredClone(currentUser), is_verified: false },
      verificationRequested: true,
    });

    await page.goto('/verify-email');
    await fillOtp(page, '123456');
    await page.getByRole('button', { name: 'CONFIRM' }).click();
    await expect(page).toHaveURL(/\/users$/);
  });

  test('later skips verification and goes to users', async ({ page, api }) => {
    void api;
    await seedAuth(page, {
      user: { ...structuredClone(currentUser), is_verified: false },
      verificationRequested: true,
    });

    await page.goto('/verify-email');
    await page.getByRole('button', { name: 'LATER' }).click();
    await expect(page).toHaveURL(/\/users$/);
  });
});
