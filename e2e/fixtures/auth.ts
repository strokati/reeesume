/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto('/');
    await page.waitForURL('**/master-resume', { timeout: 15000 }).catch(() => {
      // May redirect to login in self-hosted mode
    });
    await use(page);
  },
});

export { expect };
