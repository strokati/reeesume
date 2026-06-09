import { test, expect } from './fixtures/auth';

test('master resume page loads with sections', async ({ page }) => {
  await page.goto('/master-resume');

  await expect(page.getByText('Work Experience', { exact: true })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Education', { exact: true })).toBeVisible();
  await expect(page.getByText(/skills/i)).toBeVisible();
});
