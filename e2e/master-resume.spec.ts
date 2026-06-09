import { test, expect } from './fixtures/auth';

test('master resume page loads with sections', async ({ page }) => {
  await page.goto('/master-resume');

  await expect(page.getByText('Work Experience', { exact: true })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Education', { exact: true })).toBeVisible();
  await expect(page.getByText(/skills/i)).toBeVisible();
});

test('add a work role and verify it persists after reload', async ({ page }) => {
  await page.goto('/master-resume');

  // Click "Add Role" button
  await expect(page.getByRole('button', { name: /add role/i })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: /add role/i }).click();

  // Wait for dialog
  await expect(page.getByRole('heading', { name: /add role/i })).toBeVisible({ timeout: 5000 });

  // Fill required fields
  await page.getByLabel(/role title/i).fill('Senior Test Engineer');
  await page.getByLabel(/company/i).fill('E2E Test Corp');

  // Submit
  await page.getByRole('button', { name: 'Add Role', exact: true }).click();

  // Verify the role appears on the page
  await expect(page.getByText('Senior Test Engineer').first()).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('E2E Test Corp').first()).toBeVisible();

  // Reload the page
  await page.reload({ waitUntil: 'networkidle' });

  // Verify data persisted
  await expect(page.getByText('Senior Test Engineer').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('E2E Test Corp').first()).toBeVisible();
});
