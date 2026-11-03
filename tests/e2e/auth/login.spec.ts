import { currentUser } from '../fixtures/data';
import { seedAuth } from '../fixtures/auth';
import { expect, test } from '../fixtures/test';
import { fillField } from '../fixtures/ui';

test.describe('Auth / login', () => {
  test('shows login form and switches to sign up tab', async ({ page, api }) => {
    void api;
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'SIGN IN' })).toBeDisabled();

    await page.getByRole('link', { name: 'SIGN UP' }).click();
    await expect(page).toHaveURL(/\/register$/);
  });

  test('logs in successfully and lands on employees', async ({ page, api }) => {
    void api;
    await page.goto('/login');
    await fillField(page, 'Email', currentUser.email);
    await fillField(page, /^Password$/, 'password1');
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    await expect(page).toHaveURL(/\/users$/);
    await expect(page.getByRole('link', { name: 'Employees' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Ada', exact: true })).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page, api }) => {
    void api;
    await page.goto('/login');
    await fillField(page, 'Email', 'bad@example.com');
    await fillField(page, /^Password$/, 'wrongpass');
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    await expect(page.getByText(/Invalid email or password/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('redirects authenticated users away from login', async ({ page, api }) => {
    void api;
    await seedAuth(page);
    await page.goto('/login');
    await expect(page).toHaveURL(/\/users$/);
  });

  test('navigates to forgot password', async ({ page, api }) => {
    void api;
    await page.goto('/login');
    await page.getByRole('link', { name: 'FORGOT PASSWORD' }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });
});
