import { expect, test } from '../fixtures/test';
import { fillField } from '../fixtures/ui';

test.describe('Auth / forgot & reset password', () => {
  test('sends password recovery instructions', async ({ page, api }) => {
    void api;
    await page.goto('/forgot-password');

    await fillField(page, 'Email', 'ada@example.com');
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();

    await expect(page.getByText(/Password recovery instructions have been sent/i)).toBeVisible();
  });

  test('shows error for unknown email', async ({ page, api }) => {
    void api;
    await page.goto('/forgot-password');
    await fillField(page, 'Email', 'missing@example.com');
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();

    await expect(page.getByText(/No account found/i).first()).toBeVisible();
  });

  test('redirects reset page without token to forgot password', async ({ page, api }) => {
    void api;
    await page.goto('/reset-password');
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test('resets password with token and signs in', async ({ page, api }) => {
    void api;
    const payload = Buffer.from(
      JSON.stringify({ email: 'ada@example.com', exp: Math.floor(Date.now() / 1000) + 3600 })
    ).toString('base64url');
    const token = `header.${payload}.signature`;

    await page.goto(`/reset-password?token=${token}`);
    await fillField(page, /^Password$/, 'password1');
    await fillField(page, 'Confirm password', 'password1');
    await page.getByRole('button', { name: 'CONFIRM' }).click();

    await expect(page).toHaveURL(/\/users$/);
  });
});
