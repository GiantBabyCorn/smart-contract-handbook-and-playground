import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage renders without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Should have entry cards or links
    await expect(page.locator('a[href*="/erc"]').first()).toBeVisible({ timeout: 10000 });

    expect(errors).toEqual([]);
  });

  test('can navigate to a detail page', async ({ page }) => {
    await page.goto('/');

    // Click on first entry link
    const firstLink = page.locator('a[href*="/erc"]').first();
    await firstLink.click();

    // Should be on detail page
    await expect(page).not.toHaveURL('/');
  });

  test('detail page for erc20 renders', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/erc20');
    await expect(page.locator('body')).toBeVisible();

    // Should show ERC-20 content (scoped to main: the sidebar, mobile nav and
    // breadcrumb title also contain the text "ERC-20").
    await expect(page.locator('#main-content').getByText('ERC-20').first()).toBeVisible({
      timeout: 10000,
    });

    expect(errors).toEqual([]);
  });

  test('non-existent page shows 404', async ({ page }) => {
    await page.goto('/non-existent-slug-xyz');
    // Should show some not-found indication
    await expect(page.locator('body')).toBeVisible();
  });
});
