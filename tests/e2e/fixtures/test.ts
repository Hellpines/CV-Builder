import { test as base, expect } from '@playwright/test';
import { seedAuth } from './auth';
import { mockGraphQl } from './graphql';
import { createStore, type GraphQlStore } from './store';

type Fixtures = {
  api: GraphQlStore;
  authenticatedPage: void;
};

export const test = base.extend<Fixtures>({
  // Second arg is Playwright's fixture callback — rename so eslint doesn't treat it as React `use`.
  api: async ({ page }, provide) => {
    const store = createStore();
    await mockGraphQl(page, store);
    await provide(store);
  },

  authenticatedPage: [
    async ({ page, api: _api }, provide) => {
      void _api;
      await seedAuth(page);
      await provide();
    },
    { auto: false },
  ],
});

export { expect };

export async function openAuthenticated(page: import('@playwright/test').Page, path = '/users') {
  await seedAuth(page);
  await page.goto(path);
}
