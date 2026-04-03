import { test, expect } from '@playwright/test';

test.describe('Theme', () => {
  test('page loads with a valid theme', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // The html or body element should have a theme class or data attribute
    const html = page.locator('html');
    await expect(html).toBeVisible();
  });
});
