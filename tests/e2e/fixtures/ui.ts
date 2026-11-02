import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export function fieldByLabel(page: Page, label: string | RegExp) {
  return page
    .locator('div.relative')
    .filter({ has: page.locator('label', { hasText: label }) })
    .locator('input:not([type="file"]), textarea')
    .first();
}

export async function fillField(page: Page, label: string | RegExp, value: string) {
  const field = fieldByLabel(page, label);
  await expect(field).toBeVisible();
  await field.click();
  await field.fill(value);
  if ((await field.inputValue()) !== value) {
    await field.fill('');
    await field.pressSequentially(value, { delay: 10 });
  }
  await expect(field).toHaveValue(value);
}

export async function fillOtp(page: Page, code: string) {
  const digits = page.locator('input[inputmode="numeric"]');
  await expect(digits).toHaveCount(code.length);

  for (let index = 0; index < code.length; index += 1) {
    const cell = digits.nth(index);
    await cell.click();
    await cell.fill(code[index]!);
    await expect(cell).toHaveValue(code[index]!);
  }

  await expect(page.getByRole('button', { name: 'CONFIRM' })).toBeEnabled();
}

export function selectTriggerByLabel(page: Page, label: string | RegExp) {
  return page.getByRole('combobox', { name: label, exact: true });
}

export function selectTriggerByText(page: Page, text: string | RegExp) {
  return page.getByRole('combobox').filter({ hasText: text });
}

export async function selectOption(page: Page, trigger: Locator, optionLabel: string | RegExp) {
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  const popup = page.locator('[data-slot="select-content"]').last();
  await expect(popup).toBeVisible();

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await popup.getByRole('option', { name: optionLabel }).first().click({ timeout: 2_000 });
      break;
    } catch (error) {
      if (attempt === 2) throw error;
      if (!(await popup.isVisible().catch(() => false))) {
        await trigger.click();
        await expect(popup).toBeVisible();
      }
    }
  }

  const closed = await expect(popup)
    .toBeHidden({ timeout: 1_500 })
    .then(() => true)
    .catch(() => false);
  if (!closed) {
    await page.locator('[role="combobox"][aria-expanded="true"]').last().click();
    await expect(popup).toBeHidden();
  }
}

export async function openUserMenu(page: Page) {
  const trigger = page.locator('[data-slot="dropdown-menu-trigger"]').first();
  await trigger.click();
  await expect(page.locator('[data-slot="dropdown-menu-content"]')).toBeVisible();
  return trigger;
}

export async function expectToast(page: Page, text: string | RegExp) {
  await expect(page.locator('[aria-live="polite"]').getByText(text).first()).toBeVisible({
    timeout: 10_000,
  });
}

export function tabLink(page: Page, href: string) {
  return page.locator(`a[href="${href}"]`).last();
}
