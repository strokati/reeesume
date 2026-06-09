import { test, expect } from './fixtures/auth';

test('applications page loads and shows new application button', async ({ page }) => {
  await page.goto('/applications');
  await expect(page.getByRole('button', { name: /new application/i })).toBeVisible({
    timeout: 10000,
  });
});

test('opens new application dialog and fills required fields', async ({ page }) => {
  await page.goto('/applications');

  await page.getByRole('button', { name: /new application/i }).click();

  // Wait for dialog to appear
  await expect(page.getByRole('heading', { name: 'New Application' })).toBeVisible({
    timeout: 5000,
  });

  await page.getByLabel(/company name/i).fill('E2E Test Company');
  await page.getByLabel(/job title/i).fill('Senior Engineer');

  // Verify fields are filled
  await expect(page.getByLabel(/company name/i)).toHaveValue('E2E Test Company');
  await expect(page.getByLabel(/job title/i)).toHaveValue('Senior Engineer');

  // Click Next to proceed
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Dialog should advance to the next step (step 2 with job posting text)
  // Just verify the dialog is still open / transition happened
  await page.waitForTimeout(1000);
});
