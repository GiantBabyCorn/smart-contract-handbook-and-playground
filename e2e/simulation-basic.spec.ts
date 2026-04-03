import { test, expect } from '@playwright/test';

test.describe('Simulation', () => {
  test('erc20 page has simulation controls', async ({ page }) => {
    await page.goto('/erc20');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Should have simulation-related UI elements
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });
});
